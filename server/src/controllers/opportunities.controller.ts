import { Request, Response, NextFunction } from 'express';
import { opportunitiesService } from '../services/opportunities.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const opportunitiesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await opportunitiesService.list({
        genre: req.query.genre ? String(req.query.genre) : undefined,
        isPaid: req.query.isPaid === 'true' ? true : req.query.isPaid === 'false' ? false : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        userId: req.user?.userId,
        page: req.query.page ? parseInt(String(req.query.page)) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
      });
      res.json({
        success: true,
        data: { opportunities: result.opportunities },
        pagination: result.pagination
      });
    } catch (err) { next(err); }
  },

  async getFeatured(_req: Request, res: Response, next: NextFunction) {
    try {
      const featured = await opportunitiesService.getFeatured();
      res.json({ success: true, data: featured });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await opportunitiesService.getById(pstr(req.params.id));
      res.json({ success: true, data: opp });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await opportunitiesService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: opp });
    } catch (err) { next(err); }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await opportunitiesService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  },

  async getMatchesForDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await opportunitiesService.getMatchesForDraft(
        pstr(req.params.draftId),
        req.user!.userId
      );
      res.json({ success: true, data: { opportunities: matches } });
    } catch (err) { next(err); }
  },
};
