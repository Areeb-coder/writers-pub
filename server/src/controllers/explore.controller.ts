import { Request, Response, NextFunction } from 'express';
import { exploreService } from '../services/explore.service';

export const exploreController = {
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await exploreService.getFeed({
        genre: req.query.genre ? String(req.query.genre) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        sort: req.query.sort ? String(req.query.sort) : undefined,
        userId: req.user?.userId,
        userRole: req.user?.role,
        page: req.query.page ? parseInt(String(req.query.page)) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
      });
      res.json({ success: true, data: result.drafts, pagination: result.pagination });
    } catch (err) { next(err); }
  },

  async getTrending(_req: Request, res: Response, next: NextFunction) {
    try {
      const topics = await exploreService.getTrending();
      res.json({ success: true, data: topics });
    } catch (err) { next(err); }
  },
};
