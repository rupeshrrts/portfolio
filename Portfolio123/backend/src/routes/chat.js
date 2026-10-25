// "Ask Rupesh's agent" — answers questions about the portfolio from a curated knowledge base.
// No LLM key needed; see src/agent for the knowledge and matching logic.
import { Router } from 'express';
import { answer } from '../agent/engine.js';

const router = Router();

router.post('/', (req, res) => {
  const question = String(req.body?.message || '').trim().slice(0, 500);
  if (!question) return res.status(400).json({ error: 'Ask me something!' });
  const lastTopic = typeof req.body?.context?.lastTopic === 'string' ? req.body.context.lastTopic : undefined;
  res.json(answer(question, { lastTopic }));
});

export default router;
