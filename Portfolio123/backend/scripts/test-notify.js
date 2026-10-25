// Run with: npm run test:notify — checks the contact-form email alert (lib/notify.js) without sending anything.
import assert from 'node:assert/strict';
import { buildContactEmail, notifyNewMessage } from '../src/lib/notify.js';

const contact = {
  name: 'Priya Sharma',
  email: 'priya@example.com',
  subject: 'Full Stack Developer opening',
  message: 'Hi Rupesh,\nwe saw your portfolio <and> would like to talk.',
};

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('email contains the sender details and the full message', () => {
  const mail = buildContactEmail(contact, new Date('2026-10-24T14:15:00Z'));
  assert.equal(mail.subject, 'New portfolio message from Priya Sharma');
  for (const part of ['Priya Sharma', 'priya@example.com', 'Full Stack Developer opening', 'we saw your portfolio <and> would like to talk.']) {
    assert.ok(mail.text.includes(part), `text missing: ${part}`);
  }
  assert.ok(mail.text.includes('24 Oct 2026'), 'text has the IST date');
  assert.ok(mail.html.includes('&lt;and&gt;'), 'html escapes the visitor message');
  assert.ok(!mail.html.includes('<and>'), 'no raw HTML from the visitor');
});

test('line breaks in the name cannot inject extra headers', () => {
  const mail = buildContactEmail({ ...contact, name: 'Evil\r\nBcc: x@y.z' });
  assert.ok(!/[\r\n]/.test(mail.subject));
});

test('sends to the owner with reply-to set to the visitor', async () => {
  process.env.RESEND_API_KEY = 're_test';
  delete process.env.CONTACT_NOTIFY_EMAIL;
  let request;
  const sent = await notifyNewMessage(contact, {
    fetchImpl: async (url, init) => {
      request = { url, init };
      return { ok: true };
    },
  });
  assert.equal(sent, true);
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.init.headers.Authorization, 'Bearer re_test');
  const body = JSON.parse(request.init.body);
  assert.deepEqual(body.to, ['rkrrts@gmail.com']);
  assert.equal(body.reply_to, 'priya@example.com');
  assert.match(body.text, /would like to talk/);
});

test('CONTACT_NOTIFY_EMAIL can list several recipients', async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.CONTACT_NOTIFY_EMAIL = 'rupeshsinghsuntech@gmail.com, second@example.com';
  let body;
  await notifyNewMessage(contact, {
    fetchImpl: async (_url, init) => {
      body = JSON.parse(init.body);
      return { ok: true };
    },
  });
  assert.deepEqual(body.to, ['rupeshsinghsuntech@gmail.com', 'second@example.com']);
  delete process.env.CONTACT_NOTIFY_EMAIL;
  delete process.env.RESEND_API_KEY;
});

test('does nothing when no API key is configured', async () => {
  delete process.env.RESEND_API_KEY;
  let called = false;
  const sent = await notifyNewMessage(contact, { fetchImpl: async () => ((called = true), { ok: true }) });
  assert.equal(sent, false);
  assert.equal(called, false);
});

test('reports delivery failures so they can be logged', async () => {
  process.env.RESEND_API_KEY = 're_test';
  await assert.rejects(
    notifyNewMessage(contact, { fetchImpl: async () => ({ ok: false, status: 403, text: async () => 'domain not verified' }) }),
    /Resend responded 403: domain not verified/,
  );
  delete process.env.RESEND_API_KEY;
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.log(`✗ ${name}\n    ${err.message}`);
  }
}
console.log(`\n${passed}/${tests.length} passed`);
process.exit(passed === tests.length ? 0 : 1);
