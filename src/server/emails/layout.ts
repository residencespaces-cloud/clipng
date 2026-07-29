const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kudiclip.com";

export type EmailContent = {
  subject: string;
  /** Plain-text body stored on Notification rows */
  body: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cta(label: string, href: string) {
  return `
    <a href="${escapeHtml(href)}"
       style="display:inline-block;margin-top:24px;padding:12px 22px;background:#00E878;color:#070709;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px;">
      ${escapeHtml(label)}
    </a>`;
}

function metaRow(items: { label: string; value: string }[]) {
  if (!items.length) return "";
  const cells = items
    .map(
      (i) => `
      <td style="padding:10px 12px;border:1px solid #E8E8E4;vertical-align:top;">
        <div style="font-size:11px;color:#7A7A8A;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(i.label)}</div>
        <div style="font-size:15px;color:#111116;font-weight:600;margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(i.value)}</div>
      </td>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;"><tr>${cells}</tr></table>`;
}

/**
 * Minimal transactional shell — light canvas, green accent, one job per mail.
 */
export function renderEmail(opts: {
  title: string;
  intro: string;
  meta?: { label: string; value: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  footnote?: string;
}): string {
  const title = escapeHtml(opts.title);
  const intro = escapeHtml(opts.intro);
  const footnote = opts.footnote
    ? `<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#7A7A8A;">${escapeHtml(opts.footnote)}</p>`
    : "";
  const button =
    opts.ctaLabel && opts.ctaHref ? cta(opts.ctaLabel, opts.ctaHref) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F1;color:#111116;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E8E8E4;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 0;">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#00E878;">KudiClip</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;font-weight:700;color:#111116;">${title}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#3A3A44;">${intro}</p>
              ${metaRow(opts.meta ?? [])}
              ${button}
              ${footnote}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #E8E8E4;font-size:12px;color:#7A7A8A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              Get paid to clip · <a href="${APP_URL}" style="color:#7A7A8A;">kudiclip.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function appUrl(path = "/") {
  const base = APP_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function fmtNaira(amount: number) {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}
