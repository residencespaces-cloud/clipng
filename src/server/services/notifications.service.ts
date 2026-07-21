import { NotificationChannel, NotificationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { sendEmail } from "@/server/email";

export async function queueNotification(
  userId: string,
  subject: string,
  body: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.notification.create({
    data: {
      userId,
      channel: NotificationChannel.email,
      subject,
      body,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function notifyUser(
  userId: string,
  subject: string,
  body: string,
  metadata?: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const notification = await queueNotification(userId, subject, body, metadata);

  try {
    await sendEmail({
      to: user.email,
      subject,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto"><h2>${subject}</h2><p>${body}</p><hr/><p style="color:#666;font-size:12px">ClipNG — Get Paid to Clip</p></div>`,
    });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: NotificationStatus.sent, sentAt: new Date() },
    });
  } catch {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: NotificationStatus.failed },
    });
  }
}

export async function processPendingNotifications(limit = 50) {
  const pending = await prisma.notification.findMany({
    where: { status: NotificationStatus.pending, channel: NotificationChannel.email },
    take: limit,
    include: { user: true },
  });

  let sent = 0;
  for (const n of pending) {
    try {
      await sendEmail({
        to: n.user.email,
        subject: n.subject,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto"><h2>${n.subject}</h2><p>${n.body}</p></div>`,
      });
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.sent, sentAt: new Date() },
      });
      sent++;
    } catch {
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.failed },
      });
    }
  }
  return sent;
}
