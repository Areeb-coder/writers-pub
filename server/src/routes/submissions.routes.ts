import { Router } from 'express';
import { submissionsController } from '../controllers/submissions.controller';
import { authenticate } from '../middleware/auth';
import { isEditor } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const createSubmissionSchema = z.object({
  draft_id: objectId,
  opportunity_id: objectId,
});

const updateStatusSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected']),
});

const feedbackSchema = z.object({
  feedback: z.string().min(1),
});

router.post('/', authenticate, validate(createSubmissionSchema), submissionsController.create);
router.get('/', authenticate, submissionsController.list);
router.get('/me', authenticate, submissionsController.list);
router.get('/counts', authenticate, submissionsController.getCounts);
router.get('/editor/queue', authenticate, isEditor, submissionsController.getEditorQueue);
router.get('/editor/dashboard', authenticate, isEditor, submissionsController.getEditorQueue);
router.patch('/:id/status', authenticate, isEditor, validate(updateStatusSchema), submissionsController.updateStatus);
router.patch('/:id/feedback', authenticate, isEditor, validate(feedbackSchema), submissionsController.addFeedback);

export default router;
