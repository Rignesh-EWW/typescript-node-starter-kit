import { Router } from 'express';

const router = Router();
router.get('/', (_req, res) => res.json({ msg: 'users user route' }));

export default router;
