import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { feedbackLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const createFeedbackSchema = z.object({
  draft_id: objectId,
  scores: z.object({
    plot: z.number().min(1).max(10).optional(),
    pacing: z.number().min(1).max(10).optional(),
    character: z.number().min(1).max(10).optional(),
    characters: z.number().min(1).max(10).optional(),
    writing_style: z.number().min(1).max(10).optional(),
    grammar: z.number().min(1).max(10).optional(),
  }).refine(
    (scores) => (scores.plot ?? scores.writing_style) !== undefined &&
      (scores.pacing ?? scores.writing_style) !== undefined &&
      (scores.character ?? scores.characters) !== undefined,
    { message: 'scores must include plot, pacing/writing_style, and character/characters' }
  ),
  written_feedback: z.string().optional(),
  is_anonymous: z.boolean().optional(),
});

const inlineCommentSchema = z.object({
  draft_id: objectId,
  anchor_from: z.number().int().min(0),
  anchor_to: z.number().int().min(0),
  comment_text: z.string().min(1),
  parent_id: objectId.optional(),
});

const rateSchema = z.object({
  score: z.number().min(1).max(5),
});

router.post('/', authenticate, feedbackLimiter, validate(createFeedbackSchema), feedbackController.create);
router.get('/draft/:draftId', feedbackController.getByDraft);
router.get('/user/:userId', feedbackController.getByUser);
router.patch('/:id/rate', authenticate, validate(rateSchema), feedbackController.rateHelpfulness);
router.post('/inline', authenticate, validate(inlineCommentSchema), feedbackController.createInlineComment);
router.get('/inline/:draftId', feedbackController.getInlineComments);

export default router;
