import { Router } from 'express';
import { exploreController } from '../controllers/explore.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, exploreController.getFeed);
router.get('/trending', exploreController.getTrending);

export default router;
