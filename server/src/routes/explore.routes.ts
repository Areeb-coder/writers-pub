import { Router } from 'express';
import { exploreController } from '../controllers/explore.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, exploreController.getFeed);
router.get('/trending', exploreController.getTrending);
router.get('/leaderboard', exploreController.getLeaderboard);

export default router;
