import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import contactRouter from './routes/contact.js';
import chatRouter from './routes/chat.js';
import statsRouter from './routes/stats.js';
import { storeMode } from './lib/store.js';

const app = express();

// Comma-separated exact origins, e.g. "https://rupesh.vercel.app,http://localhost:3000".
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.set('trust proxy', 1); // behind Vercel/Render proxies — needed for correct client IPs in rate limiting
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || origins.includes('*') || origins.includes(origin)),
  }),
);
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

app.get('/', (_req, res) => res.json({ ok: true, service: 'rupesh-portfolio-api' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, store: storeMode }));
app.use('/api/contact', contactRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stats', statsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

export default app;
