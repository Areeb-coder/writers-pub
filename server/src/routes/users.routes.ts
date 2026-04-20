import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  genres: z.array(z.string()).optional(),
  avatar_url: z.string().url().optional(),
});

router.get('/leaderboard', usersController.getLeaderboard);
router.get('/me/stats', authenticate, usersController.getStats);
router.get('/me/profile', authenticate, usersController.getMyProfile);
router.get('/me/history', authenticate, usersController.getDraftHistory);
router.get('/me/reviews', authenticate, usersController.getRecentReviews);
router.get('/:id/profile', usersController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), usersController.updateProfile);

export default router;
