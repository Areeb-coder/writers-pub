import { Request, Response, NextFunction } from 'express';
import { draftsService } from '../services/drafts.service';
import { aiService } from '../services/ai.service';
import { workerService } from '../services/worker.service';

function qstr(val: any): string | undefined {
  if (val == null) return undefined;
  return String(val);
}

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const draftsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftsService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: draft });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = qstr(req.query.search);
      const status = qstr(req.query.status);
      const genre = qstr(req.query.genre);
      const page = req.query.page ? parseInt(String(req.query.page)) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;

      const result = await draftsService.list(req.user!.userId, {
        search,
        status,
        genre,
        page,
        limit,
      });

      // Backward compatibility with older frontend payload shape.
      const wantsWrappedDrafts = !!limit && !search && !status && !genre && !page;
      if (wantsWrappedDrafts) {
        return res.json({ success: true, data: { drafts: result.drafts }, pagination: result.pagination });
      }

      res.json({ success: true, data: result.drafts, pagination: result.pagination });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftsService.getById(pstr(req.params.id), req.user?.userId, req.user?.role);
      res.json({ success: true, data: draft });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftsService.update(pstr(req.params.id), req.user!.userId, req.body);
      res.json({ success: true, data: draft });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await draftsService.delete(pstr(req.params.id), req.user!.userId);
      res.json({ success: true, message: 'Draft deleted' });
    } catch (err) { next(err); }
  },

  async share(req: Request, res: Response, next: NextFunction) {
    try {
      const { visibility } = req.body;
      const result = await draftsService.share(pstr(req.params.id), req.user!.userId, visibility || 'public');
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async triggerCritique(req: Request, res: Response, next: NextFunction) {
    try {
      await workerService.queueAICritique(pstr(req.params.id), req.user!.userId);
      res.json({ 
        success: true, 
        message: 'AI analysis started in background. You will be notified when it is ready.' 
      });
    } catch (err) { next(err); }
  },

  async getCritique(req: Request, res: Response, next: NextFunction) {
    try {
      const draft = await draftsService.getById(pstr(req.params.id), req.user?.userId, req.user?.role);
      res.json({ success: true, data: draft.ai_critique });
    } catch (err) { next(err); }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await draftsService.getHistory(pstr(req.params.id), req.user!.userId, req.user!.role);
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await draftsService.getStats(req.user!.userId);
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  },
};
