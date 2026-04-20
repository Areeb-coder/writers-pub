import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const usersController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getProfile(pstr(req.params.id));
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  },

  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(String(req.query.limit || '10'));
      const leaderboard = await usersService.getLeaderboard(limit);
      res.json({ success: true, data: leaderboard });
    } catch (err) { next(err); }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await usersService.getStats(req.user!.userId);
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  },

  async getDraftHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await usersService.getDraftHistory(req.user!.userId);
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  },

  async getRecentReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'));
      const limit = parseInt(String(req.query.limit || '10'));
      const result = await usersService.getRecentReviews(req.user!.userId, page, limit);
      res.json({ success: true, data: result.reviews, pagination: result.pagination });
    } catch (err) { next(err); }
  },
};
