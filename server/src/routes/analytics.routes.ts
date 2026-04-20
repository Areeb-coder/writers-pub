import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/writing', authenticate, analyticsController.getWritingAnalytics);
router.post('/session', authenticate, analyticsController.startSession);
router.patch('/session/:id', authenticate, analyticsController.endSession);

export default router;
