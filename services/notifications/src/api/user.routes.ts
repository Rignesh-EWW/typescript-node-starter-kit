import { Router } from 'express';

const router = Router();
router.get('/', (_req, res) => res.json({ msg: 'notifications user route' }));

export default router;
