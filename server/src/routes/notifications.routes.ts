import { Router } from 'express';
import { notificationsController, achievementsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notificationsController.list);
router.patch('/:id/read', authenticate, notificationsController.markRead);
router.patch('/read-all', authenticate, notificationsController.markAllRead);

export default router;

// Achievements router (exported separately)
export const achievementsRouter = Router();
achievementsRouter.get('/', authenticate, achievementsController.list);
