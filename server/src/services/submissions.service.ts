import { AppError } from '../middleware/errorHandler';
import { SubmissionStatus } from '../types';
import { aiService } from './ai.service';
import { notificationsService } from './notifications.service';
import { emitToUser, SocketEvents } from '../socket';
import { DraftModel, OpportunityModel, SubmissionModel, UserModel } from '../models';

export const submissionsService = {
  async create(data: { draft_id: string; opportunity_id: string; submitter_id: string }) {
    const draft = await DraftModel.findById(data.draft_id).select('author_id content_text word_count').lean();
    if (!draft) throw new AppError('Draft not found', 404);

    if (String(draft.author_id) !== data.submitter_id) {
      throw new AppError('You can only submit your own drafts', 403);
    }

    const safety = await aiService.checkContentSafety(draft.content_text || '');
    if (!safety.isSafe) {
      throw new AppError(`Submission denied: ${safety.reason}`, 400);
    }

    const opp = await OpportunityModel.findById(data.opportunity_id).select('deadline is_active word_limit_max').lean();
    if (!opp) throw new AppError('Opportunity not found', 404);
    if (!opp.is_active) throw new AppError('This opportunity is no longer accepting submissions', 400);
    if (opp.deadline && new Date(opp.deadline) < new Date()) {
      throw new AppError('Submission deadline has passed', 400);
    }
    if (opp.word_limit_max && (draft.word_count || 0) > opp.word_limit_max) {
      throw new AppError(`Draft exceeds word limit (${opp.word_limit_max} words)`, 400);
    }

    const existing = await SubmissionModel.findOne({ draft_id: data.draft_id, opportunity_id: data.opportunity_id }).select('_id').lean();
    if (existing) {
      throw new AppError('This draft has already been submitted to this opportunity', 409);
    }

    const created = await SubmissionModel.create({
      draft_id: data.draft_id,
      opportunity_id: data.opportunity_id,
      submitter_id: data.submitter_id,
    });

    await DraftModel.findByIdAndUpdate(data.draft_id, { status: 'under_review' });
    await notificationsService.create({
      user_id: data.submitter_id,
      type: 'submission_update',
      title: 'Submission Sent',
      message: 'Your manuscript has been submitted and is now under review.',
      metadata: { draft_id: data.draft_id, opportunity_id: data.opportunity_id, status: 'submitted' },
    });

    return mapSubmission(created.toJSON());
  },

  async listByUser(userId: string) {
    const submissions = await SubmissionModel.find({ submitter_id: userId })
      .sort({ createdAt: -1 })
      .populate('draft_id', 'title')
      .populate({ path: 'opportunity_id', select: 'title publisher_id', populate: { path: 'publisher_id', select: 'display_name avatar_url' } })
      .lean();

    return submissions.map((s: any) => ({
      ...mapSubmission(s),
      draft_title: s.draft_id?.title || null,
      opportunity_title: s.opportunity_id?.title || null,
      publisher_name: s.opportunity_id?.publisher_id?.display_name || null,
      publisher_avatar: s.opportunity_id?.publisher_id?.avatar_url || null,
    }));
  },

  async getCounts(userId: string) {
    const [submitted, shortlisted, accepted, rejected] = await Promise.all([
      SubmissionModel.countDocuments({ submitter_id: userId, status: 'submitted' }),
      SubmissionModel.countDocuments({ submitter_id: userId, status: 'shortlisted' }),
      SubmissionModel.countDocuments({ submitter_id: userId, status: 'accepted' }),
      SubmissionModel.countDocuments({ submitter_id: userId, status: 'rejected' }),
    ]);

    return { submitted, shortlisted, accepted, rejected };
  },

  async updateStatus(submissionId: string, editorId: string, status: SubmissionStatus) {
    const submission = await SubmissionModel.findById(submissionId)
      .populate({ path: 'opportunity_id', select: 'publisher_id' })
      .lean();

    if (!submission) throw new AppError('Submission not found', 404);

    const publisherId = String((submission.opportunity_id as any)?.publisher_id);
    if (publisherId !== editorId) {
      throw new AppError('Only the publisher can update submission status', 403);
    }

    const updated = await SubmissionModel.findByIdAndUpdate(
      submissionId,
      { status, reviewed_at: new Date() },
      { new: true }
    ).lean();

    if (!updated) throw new AppError('Submission not found', 404);

    if (status === 'accepted') {
      await DraftModel.findByIdAndUpdate(updated.draft_id, { status: 'accepted' });
      await UserModel.findByIdAndUpdate(updated.submitter_id, { $inc: { trust_score: 10 } });
    } else if (status === 'rejected') {
      await DraftModel.findByIdAndUpdate(updated.draft_id, { status: 'shared' });
    } else if (status === 'shortlisted') {
      await DraftModel.findByIdAndUpdate(updated.draft_id, { status: 'under_review' });
    }

    const notification = await notificationsService.create({
      user_id: String(updated.submitter_id),
      type: 'submission_update',
      title: `Submission ${status}`,
      message: `Your submission status changed to "${status}".`,
      metadata: { submission_id: submissionId, draft_id: String(updated.draft_id), status },
    });

    emitToUser(String(updated.submitter_id), SocketEvents.SUBMISSION_UPDATE, {
      submissionId,
      status,
      notificationId: notification.id,
    });
    emitToUser(String(updated.submitter_id), SocketEvents.USER_SUBMISSION_UPDATE, {
      submissionId,
      status,
      notificationId: notification.id,
    });

    return mapSubmission(updated);
  },

  async addFeedback(submissionId: string, editorId: string, feedback: string) {
    const submission = await SubmissionModel.findById(submissionId)
      .populate({ path: 'opportunity_id', select: 'publisher_id' })
      .lean();

    if (!submission) throw new AppError('Submission not found', 404);

    const publisherId = String((submission.opportunity_id as any)?.publisher_id);
    if (publisherId !== editorId) {
      throw new AppError('Only the publisher can add feedback', 403);
    }

    const updated = await SubmissionModel.findByIdAndUpdate(submissionId, { editor_feedback: feedback }, { new: true }).lean();
    if (!updated) throw new AppError('Submission not found', 404);

    const notification = await notificationsService.create({
      user_id: String(updated.submitter_id),
      type: 'feedback_received',
      title: 'Editor feedback received',
      message: 'An editor left feedback on your submission.',
      metadata: { submission_id: submissionId },
    });

    emitToUser(String(updated.submitter_id), SocketEvents.FEEDBACK_RECEIVED, {
      submissionId,
      notificationId: notification.id,
    });

    return mapSubmission(updated);
  },

  async getEditorQueue(editorId: string) {
    const opportunities = await OpportunityModel.find({ publisher_id: editorId }).select('_id').lean();
    const opportunityIds = opportunities.map((o: any) => o._id);

    const queue = await SubmissionModel.find({ opportunity_id: { $in: opportunityIds } })
      .populate('draft_id', 'title genre word_count')
      .populate('submitter_id', 'display_name avatar_url trust_score')
      .sort({ createdAt: -1 })
      .lean();

    return queue.map((s: any) => ({
      ...mapSubmission(s),
      draft_title: s.draft_id?.title || null,
      genre: s.draft_id?.genre || null,
      word_count: s.draft_id?.word_count || 0,
      submitter_name: s.submitter_id?.display_name || null,
      submitter_avatar: s.submitter_id?.avatar_url || null,
      trust_score: s.submitter_id?.trust_score || 0,
    }));
  },
};

function mapSubmission(s: any) {
  return {
    ...s,
    id: s.id || String(s._id),
    draft_id: String(s.draft_id?._id || s.draft_id),
    opportunity_id: String(s.opportunity_id?._id || s.opportunity_id),
    submitter_id: String(s.submitter_id?._id || s.submitter_id),
    created_at: s.created_at || s.createdAt,
    updated_at: s.updated_at || s.updatedAt,
  };
}
