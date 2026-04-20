import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const analyticsController = {
  async getWritingAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getWritingAnalytics(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await analyticsService.startSession(req.user!.userId, req.body.draft_id);
      res.status(201).json({ success: true, data: session });
    } catch (err) { next(err); }
  },

  async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await analyticsService.endSession(
        pstr(req.params.id), req.user!.userId, req.body.words_written || 0
      );
      res.json({ success: true, data: session });
    } catch (err) { next(err); }
  },
};
