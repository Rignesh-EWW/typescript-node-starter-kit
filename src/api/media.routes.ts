import { Router } from 'express';
import mediaRoutes from '@/routes/media';

const router = Router();
router.use('/', mediaRoutes);

export default router;
