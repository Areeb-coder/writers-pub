import { AppError } from '../middleware/errorHandler';
import { DraftModel, FeedbackModel, InlineCommentModel, UserModel, normalize } from '../models';
import { notificationsService } from './notifications.service';
import { emitToUser, SocketEvents } from '../socket';

export const feedbackService = {
  async create(data: { draft_id: string; reviewer_id: string; scores: any; written_feedback?: string; is_anonymous?: boolean }) {
    const draft = await DraftModel.findById(data.draft_id).lean();
    if (!draft) throw new AppError('Draft not found', 404);
    if (String(draft.author_id) === data.reviewer_id) {
      throw new AppError('Cannot review your own draft', 400);
    }
    if (draft.visibility === 'private') {
      throw new AppError('This draft is private and cannot be reviewed', 403);
    }

    const existing = await FeedbackModel.findOne({ draft_id: data.draft_id, reviewer_id: data.reviewer_id }).select('_id').lean();
    if (existing) {
      throw new AppError('You have already reviewed this draft', 409);
    }

    const created = await FeedbackModel.create({
      draft_id: data.draft_id,
      reviewer_id: data.reviewer_id,
      scores: data.scores,
      written_feedback: data.written_feedback || null,
      is_anonymous: data.is_anonymous || false,
    });

    const notification = await notificationsService.create({
      user_id: String(draft.author_id),
      type: 'feedback_received',
      title: 'New critique received',
      message: 'A reviewer submitted structured feedback on your draft.',
      metadata: { draft_id: data.draft_id, feedback_id: created.id },
    });

    emitToUser(String(draft.author_id), SocketEvents.FEEDBACK_RECEIVED, {
      draftId: data.draft_id,
      feedbackId: created.id,
      notificationId: notification.id,
    });
    emitToUser(String(draft.author_id), SocketEvents.USER_FEEDBACK_RECEIVED, {
      draftId: data.draft_id,
      feedbackId: created.id,
      notificationId: notification.id,
    });

    return mapFeedback(normalize(created));
  },

  async getByDraft(draftId: string) {
    const rows = await FeedbackModel.find({ draft_id: draftId })
      .sort({ createdAt: -1 })
      .populate('reviewer_id', 'display_name avatar_url')
      .lean();

    return rows.map((f: any) => ({
      ...mapFeedback(f),
      reviewer_name: f.reviewer_id?.display_name || 'Anonymous',
      reviewer_avatar: f.reviewer_id?.avatar_url || null,
    }));
  },

  async getByUser(userId: string, page: number = 1, limit: number = 10) {
    const total = await FeedbackModel.countDocuments({ reviewer_id: userId });
    const rows = await FeedbackModel.find({ reviewer_id: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('draft_id', 'title author_id')
      .lean();

    const authorIds = rows.map((r: any) => r.draft_id?.author_id).filter(Boolean);
    const authors = await UserModel.find({ _id: { $in: authorIds } }).select('display_name').lean();
    const authorMap = new Map(authors.map((a: any) => [String(a._id), a.display_name]));

    return {
      reviews: rows.map((r: any) => ({
        id: String(r._id),
        draft_id: String(r.draft_id?._id),
        scores: r.scores,
        helpfulness_score: r.helpfulness_score,
        is_anonymous: r.is_anonymous,
        created_at: r.createdAt,
        draft_title: r.draft_id?.title || null,
        author_name: r.draft_id?.author_id ? authorMap.get(String(r.draft_id.author_id)) || null : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async rateHelpfulness(feedbackId: string, writerId: string, score: number) {
    const fb = await FeedbackModel.findById(feedbackId).lean();
    if (!fb) throw new AppError('Feedback not found', 404);

    const draft = await DraftModel.findById(fb.draft_id).select('author_id').lean();
    if (!draft) throw new AppError('Feedback not found', 404);
    if (String(draft.author_id) !== writerId) {
      throw new AppError('Only the draft author can rate feedback', 403);
    }

    const updated = await FeedbackModel.findByIdAndUpdate(feedbackId, { helpfulness_score: score }, { new: true }).lean();
    if (!updated) throw new AppError('Feedback not found', 404);

    if (score >= 4) {
      await UserModel.findByIdAndUpdate(fb.reviewer_id, { $inc: { trust_score: 2 } });
    }

    return mapFeedback(updated);
  },

  async createInlineComment(data: { draft_id: string; user_id: string; anchor_from: number; anchor_to: number; comment_text: string; parent_id?: string }) {
    const created = await InlineCommentModel.create({
      ...data,
      parent_id: data.parent_id || null,
    });
    return mapInlineComment(normalize(created));
  },

  async getInlineComments(draftId: string) {
    const rows = await InlineCommentModel.find({ draft_id: draftId })
      .sort({ anchor_from: 1, createdAt: 1 })
      .populate('user_id', 'display_name avatar_url')
      .lean();

    return rows.map((ic: any) => ({
      ...mapInlineComment(ic),
      user_name: ic.user_id?.display_name || 'Unknown',
      user_avatar: ic.user_id?.avatar_url || null,
    }));
  },
};

function mapFeedback(f: any) {
  return {
    ...f,
    id: f.id || String(f._id),
    draft_id: String(f.draft_id),
    reviewer_id: String(f.reviewer_id),
    created_at: f.created_at || f.createdAt,
    updated_at: f.updated_at || f.updatedAt,
  };
}

function mapInlineComment(ic: any) {
  return {
    ...ic,
    id: ic.id || String(ic._id),
    draft_id: String(ic.draft_id),
    user_id: String(ic.user_id),
    parent_id: ic.parent_id ? String(ic.parent_id) : null,
    created_at: ic.created_at || ic.createdAt,
    updated_at: ic.updated_at || ic.updatedAt,
  };
}
