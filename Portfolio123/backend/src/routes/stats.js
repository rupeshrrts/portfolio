import { Router } from 'express';
import { getViews, incrementViews } from '../lib/store.js';

const router = Router();

router.get('/views', async (_req, res, next) => {
  try {
    res.json({ views: await getViews() });
  } catch (err) {
    next(err);
  }
});

router.post('/views', async (_req, res, next) => {
  try {
    res.json({ views: await incrementViews() });
  } catch (err) {
    next(err);
  }
});

export default router;
