import { NotificationChannel, NotificationStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { sendEmail } from "@/server/email";
import type { EmailContent } from "@/server/emails/layout";
import { appUrl } from "@/server/emails/layout";
import { signEmailActionToken } from "@/server/emails/tokens";
import * as T from "@/server/emails/templates";

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
  html?: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const notification = await queueNotification(userId, subject, body, metadata);
  const markup =
    html ??
    `<div style="font-family:sans-serif;max-width:560px;margin:0 auto"><h2>${subject}</h2><p>${body}</p><hr/><p style="color:#666;font-size:12px">KudiClip</p></div>`;

  try {
    await sendEmail({ to: user.email, subject, html: markup });
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

export async function notifyEmail(
  userId: string,
  content: EmailContent,
  metadata?: Record<string, unknown>,
) {
  return notifyUser(userId, content.subject, content.body, metadata, content.html);
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

export async function notifyAllAdmins(content: EmailContent, metadata?: Record<string, unknown>) {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.admin, status: "active" },
    select: { id: true },
  });
  await Promise.all(admins.map((a) => notifyEmail(a.id, content, metadata)));
}

export async function notifyClippersNewCampaign(campaignName: string, cpmNaira: number, campaignId: string) {
  const clippers = await prisma.user.findMany({
    where: { role: UserRole.clipper, status: "active" },
    select: { id: true },
    take: 500,
  });
  const content = T.newLiveCampaign(campaignName, cpmNaira);
  // Fire-and-forget style sequential to avoid slamming Resend on large lists
  for (const c of clippers) {
    await notifyEmail(c.id, content, { campaignId });
  }
  return clippers.length;
}

export async function sendVerifyEmail(userId: string, email: string, name: string) {
  const token = await signEmailActionToken("verify_email", userId, email, "24h");
  const url = appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return notifyEmail(userId, T.verifyEmail(name, url), { purpose: "verify_email" });
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = await signEmailActionToken("reset_password", userId, email, "1h");
  const url = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return notifyEmail(userId, T.passwordReset(url), { purpose: "reset_password" });
}

export async function sendLoginAlert(userId: string, email: string) {
  return notifyEmail(userId, T.loginAlert(email, new Date().toISOString()), {
    purpose: "login_alert",
  });
}
