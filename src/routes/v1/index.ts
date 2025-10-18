import { Router } from 'express';
import healthRoutes from './health/health.routes';
import taskRoutes from './task/task.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/task', taskRoutes);

export default router;
