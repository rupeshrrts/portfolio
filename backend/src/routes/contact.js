import { createHash } from 'node:crypto';
import { Router } from 'express';
import { hitRateLimit, saveMessage } from '../lib/store.js';
import { notifyNewMessage } from '../lib/notify.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGES_PER_HOUR = 5; // per visitor — keeps bots from flooding the inbox

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (name.length < 2 || name.length > 100) return res.status(400).json({ error: 'Please enter your name.' });
    if (!EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ error: 'Please enter a valid email.' });
    if (message.length < 10 || message.length > 3000) {
      return res.status(400).json({ error: 'Message should be between 10 and 3000 characters.' });
    }

    const visitor = createHash('sha256').update(`${process.env.RATE_LIMIT_SALT || ''}:${req.ip}`).digest('hex');
    if (!(await hitRateLimit(`contact:${visitor}`, MESSAGES_PER_HOUR, 3600))) {
      return res.status(429).json({ error: 'You have sent several messages already — please try again in an hour.' });
    }

    const contact = { name, email, subject: subject.slice(0, 200), message };
    await saveMessage(contact);

    // The message is already saved, so a failed email never loses it — it's still in Supabase.
    try {
      await notifyNewMessage(contact);
    } catch (err) {
      console.error('[contact] email notification failed:', err.message);
    }

    res.status(201).json({ ok: true, message: 'Thanks! Your message has been received.' });
  } catch (err) {
    next(err);
  }
});

export default router;
