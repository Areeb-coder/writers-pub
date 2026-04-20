import { Router } from 'express';
import { draftsController } from '../controllers/drafts.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { isWriter } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { aiLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const createDraftSchema = z.object({
  title: z.string().min(1).max(500),
  genre: z.string().optional(),
  content: z.any().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
});

const updateDraftSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.any().optional(),
  genre: z.string().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['draft', 'shared', 'under_review', 'accepted', 'published']).optional(),
});

const shareSchema = z.object({
  visibility: z.enum(['private', 'editors_only', 'public']),
});

router.get('/stats', authenticate, draftsController.getStats);
router.get('/', authenticate, draftsController.list);
router.post('/', authenticate, isWriter, validate(createDraftSchema), draftsController.create);
router.get('/:id', optionalAuth, draftsController.getById);
router.put('/:id', authenticate, isWriter, validate(updateDraftSchema), draftsController.update);
router.delete('/:id', authenticate, draftsController.delete);
router.post('/:id/share', authenticate, validate(shareSchema), draftsController.share);
router.post('/:id/critique', authenticate, aiLimiter, draftsController.triggerCritique);
router.get('/:id/critique', optionalAuth, draftsController.getCritique);
router.get('/:id/history', authenticate, draftsController.getHistory);

export default router;
