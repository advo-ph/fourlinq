import nodemailer, { Transporter } from "nodemailer";

/**
 * Inquiry-notification mailer (Phase 2 scaffolding, Tita ask 2026-05-25).
 *
 * Behaviour:
 *   - If SMTP credentials are configured, sends a plain-HTML email to MAIL_TO
 *     (default sales@fourlinq.com) with reply-to set to the inquirer.
 *   - If credentials are missing, no-ops with a console warning so dev and
 *     pre-credential prod don't fail. The DB insert is always the source of
 *     truth — email is best-effort notification.
 *
 * Env vars (all optional until enabled):
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE (true|false), SMTP_USER, SMTP_PASS
 *   MAIL_FROM   default: SMTP_USER
 *   MAIL_TO     default: "sales@fourlinq.com"
 *   MAIL_BCC    optional comma-separated list
 */

const MAIL_TO = process.env.MAIL_TO || "sales@fourlinq.com";
const MAIL_BCC = process.env.MAIL_BCC?.split(",").map((s) => s.trim()).filter(Boolean) || [];
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

const credentialsConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

if (credentialsConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER!, pass: SMTP_PASS! },
  });
  console.log(`[mailer] SMTP configured — notifications will send to ${MAIL_TO}`);
} else {
  console.warn("[mailer] SMTP credentials missing — inquiry notifications will be skipped. Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable.");
}

export interface InquiryNotification {
  type: "contact" | "quote-request" | "save-configuration";
  refId: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  /** Extra structured payload — included as a key:value list in the email body. */
  extra?: Record<string, unknown>;
  /** Source URL or path where the inquiry was submitted. */
  source?: string;
}

const escapeHtml = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function renderHtml(n: InquiryNotification): string {
  const extraRows = n.extra
    ? Object.entries(n.extra)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111;">${escapeHtml(v)}</td></tr>`)
        .join("")
    : "";

  return `<!DOCTYPE html><html><body style="font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:640px;margin:24px auto;padding:0 16px;">
    <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#888;margin:0 0 8px;">New ${escapeHtml(n.type)} inquiry · ${escapeHtml(n.refId)}</p>
    <h1 style="font-size:22px;margin:0 0 20px;font-weight:500;">${escapeHtml(n.name)}</h1>
    <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
      <tr><td style="padding:6px 12px 6px 0;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(n.email)}" style="color:#111;">${escapeHtml(n.email)}</a></td></tr>
      ${n.phone ? `<tr><td style="padding:6px 12px 6px 0;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">Phone</td><td style="padding:6px 0;">${escapeHtml(n.phone)}</td></tr>` : ""}
      ${n.subject ? `<tr><td style="padding:6px 12px 6px 0;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">Subject</td><td style="padding:6px 0;">${escapeHtml(n.subject)}</td></tr>` : ""}
      ${extraRows}
      ${n.source ? `<tr><td style="padding:6px 12px 6px 0;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;">Source</td><td style="padding:6px 0;color:#888;">${escapeHtml(n.source)}</td></tr>` : ""}
    </table>
    ${n.message ? `<div style="border-top:1px solid #eee;padding-top:16px;white-space:pre-wrap;">${escapeHtml(n.message)}</div>` : ""}
    <p style="font-size:11px;color:#aaa;margin-top:24px;">Sent automatically by FourlinQ. Reply directly to reach the inquirer.</p>
  </body></html>`;
}

export async function sendInquiryNotification(n: InquiryNotification): Promise<void> {
  if (!transporter) return; // no-op when SMTP not configured

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      bcc: MAIL_BCC.length ? MAIL_BCC : undefined,
      replyTo: n.email,
      subject: n.subject || `New ${n.type} inquiry — ${n.name} (${n.refId})`,
      html: renderHtml(n),
    });
    console.log(`[mailer] Sent ${n.type} notification ${n.refId} to ${MAIL_TO}`);
  } catch (err) {
    // Email failure must not break the inquiry flow — DB insert already succeeded.
    console.error(`[mailer] Failed to send ${n.type} notification ${n.refId}:`, err);
  }
}
