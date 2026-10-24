import { Router } from 'express';
import { saveMessage } from '../lib/store.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    await saveMessage({ name, email, subject: subject.slice(0, 200), message });
    res.status(201).json({ ok: true, message: 'Thanks! Your message has been received.' });
  } catch (err) {
    next(err);
  }
});

export default router;
