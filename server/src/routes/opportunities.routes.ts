import { Router } from 'express';
import { opportunitiesController } from '../controllers/opportunities.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { isEditor } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createOppSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  word_limit_max: z.number().int().optional(),
  is_paid: z.boolean().optional(),
  payment_details: z.string().optional(),
  is_featured: z.boolean().optional(),
});

router.get('/stats', opportunitiesController.getStats);
router.get('/featured', opportunitiesController.getFeatured);
router.get('/', optionalAuth, opportunitiesController.list);
router.get('/matches/:draftId', authenticate, opportunitiesController.getMatchesForDraft);
router.get('/:id', opportunitiesController.getById);
router.post('/', authenticate, isEditor, validate(createOppSchema), opportunitiesController.create);

export default router;
