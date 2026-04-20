import { Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback.service';

function pstr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : String(val || '');
}

export const feedbackController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const normalizedScores = {
        plot: req.body.scores.plot ?? req.body.scores.writing_style,
        pacing: req.body.scores.pacing ?? req.body.scores.writing_style,
        character: req.body.scores.character ?? req.body.scores.characters,
        grammar: req.body.scores.grammar,
      };

      const result = await feedbackService.create({
        draft_id: req.body.draft_id,
        reviewer_id: req.user!.userId,
        scores: normalizedScores,
        written_feedback: req.body.written_feedback,
        is_anonymous: req.body.is_anonymous,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getByDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await feedbackService.getByDraft(pstr(req.params.draftId));
      res.json({ success: true, data: feedback });
    } catch (err) { next(err); }
  },

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'));
      const limit = parseInt(String(req.query.limit || '10'));
      const result = await feedbackService.getByUser(pstr(req.params.userId), page, limit);
      res.json({ success: true, data: result.reviews, pagination: result.pagination });
    } catch (err) { next(err); }
  },

  async rateHelpfulness(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.rateHelpfulness(
        pstr(req.params.id),
        req.user!.userId,
        req.body.score
      );
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async createInlineComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.createInlineComment({
        draft_id: req.body.draft_id,
        user_id: req.user!.userId,
        anchor_from: req.body.anchor_from,
        anchor_to: req.body.anchor_to,
        comment_text: req.body.comment_text,
        parent_id: req.body.parent_id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getInlineComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await feedbackService.getInlineComments(pstr(req.params.draftId));
      res.json({ success: true, data: comments });
    } catch (err) { next(err); }
  },
};
