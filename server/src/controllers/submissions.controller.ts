import { Request, Response, NextFunction } from 'express';
import { submissionsService } from '../services/submissions.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const submissionsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await submissionsService.create({
        draft_id: req.body.draft_id,
        opportunity_id: req.body.opportunity_id,
        submitter_id: req.user!.userId,
      });
      res.status(201).json({ success: true, data: submission });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const submissions = await submissionsService.listByUser(req.user!.userId);
      res.json({ success: true, data: submissions });
    } catch (err) { next(err); }
  },

  async getCounts(req: Request, res: Response, next: NextFunction) {
    try {
      const counts = await submissionsService.getCounts(req.user!.userId);
      res.json({ success: true, data: counts });
    } catch (err) { next(err); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await submissionsService.updateStatus(
        pstr(req.params.id), req.user!.userId, req.body.status
      );
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async addFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await submissionsService.addFeedback(
        pstr(req.params.id), req.user!.userId, req.body.feedback
      );
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getEditorQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await submissionsService.getEditorQueue(req.user!.userId);
      res.json({ success: true, data: queue });
    } catch (err) { next(err); }
  },
};
