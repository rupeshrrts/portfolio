// Emails the site owner whenever someone submits the contact form, via Resend (https://resend.com,
// free tier). Optional: without RESEND_API_KEY nothing is sent and messages are only stored in Supabase.
//
// RESEND_API_KEY        Resend API key (re_...)
// CONTACT_NOTIFY_EMAIL  where alerts go, comma-separated for several (default: the portfolio owner's Gmail)
// CONTACT_FROM_EMAIL    sender; Resend's shared onboarding@resend.dev works without a domain, but only
//                       delivers to the email address the Resend account was created with
const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_TO = 'rkrrts@gmail.com';
const DEFAULT_FROM = 'Portfolio Contact <onboarding@resend.dev>';

export const notificationsEnabled = () => Boolean(process.env.RESEND_API_KEY);

export function recipients() {
  const list = (process.env.CONTACT_NOTIFY_EMAIL || DEFAULT_TO)
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return list.length ? list : [DEFAULT_TO];
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Header-like fields must stay on one line.
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();

export function buildContactEmail({ name, email, subject, message }, now = new Date()) {
  const sent = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const topic = subject ? oneLine(subject) : '(no subject)';
  const text = [
    `New message from your portfolio contact form`,
    ``,
    `Name:    ${oneLine(name)}`,
    `Email:   ${oneLine(email)}`,
    `Subject: ${topic}`,
    `Sent:    ${sent} IST`,
    ``,
    `Message:`,
    message,
    ``,
    `Reply to this email to answer ${oneLine(name)} directly.`,
  ].join('\n');

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top">${label}</td><td style="padding:6px 0;color:#111827">${value}</td></tr>`;
  const html = `
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
  <h2 style="margin:0 0 4px;color:#1f3864">New portfolio message</h2>
  <p style="margin:0 0 16px;color:#6b7280">Someone wants to connect with you.</p>
  <table style="border-collapse:collapse;font-size:15px">
    ${row('Name', escapeHtml(oneLine(name)))}
    ${row('Email', `<a href="mailto:${escapeHtml(oneLine(email))}">${escapeHtml(oneLine(email))}</a>`)}
    ${row('Subject', escapeHtml(topic))}
    ${row('Sent', `${escapeHtml(sent)} IST`)}
  </table>
  <div style="margin-top:16px;padding:14px 16px;background:#f3f4f6;border-radius:8px;color:#111827;white-space:pre-wrap;font-size:15px;line-height:1.5">${escapeHtml(message)}</div>
  <p style="margin:16px 0 0;color:#6b7280;font-size:13px">Hit <b>Reply</b> to answer ${escapeHtml(oneLine(name))} directly. This message is also saved in Supabase → contact_messages.</p>
</div>`;

  return { subject: `New portfolio message from ${oneLine(name)}`.slice(0, 150), text, html };
}

/** Sends the alert. Returns true when sent, false when not configured; throws on delivery failure. */
export async function notifyNewMessage(contact, { fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const mail = buildContactEmail(contact);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: recipients(),
        reply_to: oneLine(contact.email),
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 200)}`);
    }
    return true;
  } finally {
    clearTimeout(timer);
  }
}
