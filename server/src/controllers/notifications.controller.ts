import { Request, Response, NextFunction } from 'express';
import { notificationsService } from '../services/notifications.service';
import { achievementsService } from '../services/achievements.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'));
      const limit = parseInt(String(req.query.limit || '20'));
      const result = await notificationsService.list(req.user!.userId, page, limit);
      res.json({
        success: true,
        data: result.notifications,
        unread_count: result.unread_count,
        pagination: result.pagination,
      });
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markRead(pstr(req.params.id), req.user!.userId);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllRead(req.user!.userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) { next(err); }
  },
};

export const achievementsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      await achievementsService.checkAndUpdate(req.user!.userId);
      const achievements = await achievementsService.getUserAchievements(req.user!.userId);
      res.json({ success: true, data: achievements });
    } catch (err) { next(err); }
  },
};
