import { AppError } from '../middleware/errorHandler';
import { DraftModel, FeedbackModel, UserModel } from '../models';

export const usersService = {
  async getProfile(userId: string) {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new AppError('User not found', 404);

    const [reviews_given, authoredDrafts, drafts_published, total_words, rank, impact] = await Promise.all([
      FeedbackModel.countDocuments({ reviewer_id: userId }),
      DraftModel.find({ author_id: userId }).select('_id').lean(),
      DraftModel.countDocuments({ author_id: userId, status: 'published' }),
      DraftModel.aggregate([{ $match: { author_id: user._id } }, { $group: { _id: null, words: { $sum: '$word_count' } } }]),
      UserModel.countDocuments({ trust_score: { $gt: user.trust_score } }).then((c) => c + 1),
      FeedbackModel.aggregate([{ $match: { reviewer_id: user._id } }, { $group: { _id: null, impact: { $sum: '$helpfulness_score' } } }]),
    ]);
    const feedbackDocs = await FeedbackModel.find({ draft_id: { $in: authoredDraftsIds(authoredDrafts) } }).select('scores').lean();

    const feedback_received = feedbackDocs.length;
    const avg_rating = feedback_received
      ? Number((feedbackDocs.reduce((sum: number, f: any) => sum + ((f.scores.plot + f.scores.pacing + f.scores.character) / 3), 0) / feedback_received).toFixed(2))
      : 0;

    return {
      id: String(user._id),
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
      genres: user.genres || [],
      trust_score: user.trust_score,
      streak_days: user.streak_days,
      is_verified: user.is_verified,
      created_at: user.createdAt,
      stats: {
        reviews_given,
        feedback_received,
        avg_rating,
        drafts_published,
        total_words: total_words[0]?.words || 0,
        rank,
        impact: impact[0]?.impact || 0,
      },
    };
  },

  async updateProfile(userId: string, data: { display_name?: string; bio?: string; genres?: string[]; avatar_url?: string }) {
    const update: any = {};
    if (data.display_name !== undefined) update.display_name = data.display_name;
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.genres !== undefined) update.genres = data.genres;
    if (data.avatar_url !== undefined) update.avatar_url = data.avatar_url;

    if (!Object.keys(update).length) throw new AppError('No fields to update', 400);

    const user = await UserModel.findByIdAndUpdate(userId, update, { new: true }).lean();
    if (!user) throw new AppError('User not found', 404);

    return {
      id: String(user._id),
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
      genres: user.genres || [],
      trust_score: user.trust_score,
      streak_days: user.streak_days,
      is_verified: user.is_verified,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  },

  async getLeaderboard(limit: number = 10) {
    const users = await UserModel.find({})
      .sort({ trust_score: -1 })
      .limit(limit)
      .select('display_name avatar_url trust_score')
      .lean();

    const userIds = users.map((u: any) => u._id);
    const feedbackCounts = await FeedbackModel.aggregate([
      { $match: { reviewer_id: { $in: userIds } } },
      { $group: { _id: '$reviewer_id', count: { $sum: 1 } } },
    ]);
    const map = new Map(feedbackCounts.map((f: any) => [String(f._id), f.count]));

    return users.map((u: any) => ({
      id: String(u._id),
      display_name: u.display_name,
      avatar_url: u.avatar_url,
      trust_score: u.trust_score,
      reviews_given: map.get(String(u._id)) || 0,
    }));
  },

  async getStats(userId: string) {
    const profile = await this.getProfile(userId);
    return {
      trust_score: profile.trust_score,
      streak_days: profile.streak_days,
      reviews_given: profile.stats.reviews_given,
      feedback_received: profile.stats.feedback_received,
      avg_rating: profile.stats.avg_rating,
      drafts_published: profile.stats.drafts_published,
      total_words: profile.stats.total_words,
      rank: profile.stats.rank,
      impact: profile.stats.impact,
    };
  },

  async getDraftHistory(userId: string) {
    const drafts = await DraftModel.find({ author_id: userId }).sort({ updatedAt: -1 }).lean();

    const draftIds = drafts.map((d: any) => d._id);
    const feedbackCounts = await FeedbackModel.aggregate([
      { $match: { draft_id: { $in: draftIds } } },
      { $group: { _id: '$draft_id', count: { $sum: 1 } } },
    ]);
    const map = new Map(feedbackCounts.map((f: any) => [String(f._id), f.count]));

    return drafts.map((d: any) => ({
      id: String(d._id),
      title: d.title,
      genre: d.genre,
      status: d.status,
      visibility: d.visibility,
      word_count: d.word_count,
      progress: d.progress,
      updated_at: d.updatedAt,
      feedback_count: map.get(String(d._id)) || 0,
    }));
  },

  async getRecentReviews(userId: string, page: number = 1, limit: number = 10) {
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
        created_at: r.createdAt,
        helpfulness_score: r.helpfulness_score,
        written_feedback: r.written_feedback,
        draft_id: String(r.draft_id?._id),
        draft_title: r.draft_id?.title || null,
        author_id: r.draft_id?.author_id ? String(r.draft_id.author_id) : null,
        author_name: r.draft_id?.author_id ? authorMap.get(String(r.draft_id.author_id)) || null : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },
};

function authoredDraftsIds(drafts: any[]) {
  return drafts.map((d) => d._id);
}
