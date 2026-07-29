import "dotenv/config";

async function main() {
  const to = "rabiutemi@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "KudiClip <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set in .env");
    process.exit(1);
  }

  console.log("From:", from);
  console.log("To:", to);
  console.log("Key prefix:", apiKey.slice(0, 6) + "...");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "You just logged in to KudiClip",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
          <h2 style="margin-bottom: 8px;">You just logged in</h2>
          <p style="color: #444; line-height: 1.5;">
            This is a test email from KudiClip to confirm Resend is working.
            A sign-in was recorded for <strong>${to}</strong>.
          </p>
          <p style="color: #666; font-size: 13px;">
            If this wasn’t you, change your password and contact support.
          </p>
          <p style="margin-top: 24px; color: #999; font-size: 12px;">— KudiClip</p>
        </div>
      `,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Resend failed:", res.status, body);
    process.exit(1);
  }

  console.log("Sent OK:", body);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
