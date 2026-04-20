import { DraftModel } from '../models';

export const exploreService = {
  async getFeed(opts: { genre?: string; search?: string; sort?: string; userId?: string; userRole?: string; page?: number; limit?: number }) {
    const { genre, search, sort = 'recent', userRole, page = 1, limit = 10 } = opts;

    const filter: any = {};
    if (userRole === 'editor' || userRole === 'admin') {
      filter.visibility = { $in: ['public', 'editors_only'] };
    } else {
      filter.visibility = 'public';
    }

    if (genre && genre !== 'All') filter.genre = genre;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content_text: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await DraftModel.countDocuments(filter);
    const rows = await DraftModel.find(filter)
      .populate('author_id', 'display_name avatar_url')
      .sort(sortToMongoSort(sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      drafts: rows.map((d: any) => ({
        id: String(d._id),
        title: d.title,
        genre: d.genre,
        word_count: d.word_count,
        ai_critique: d.ai_critique,
        created_at: d.createdAt,
        author_id: String(d.author_id?._id || d.author_id),
        author_name: d.author_id?.display_name || 'Unknown',
        author_avatar: d.author_id?.avatar_url || null,
        critique_count: 0,
        excerpt: d.content_text ? `${String(d.content_text).slice(0, 300)}...` : null,
        ai_scores: d.ai_critique?.scores || null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getTrending() {
    const genres = await DraftModel.aggregate([
      { $match: { visibility: 'public', createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, genre: { $ne: null } } },
      { $group: { _id: '$genre', cnt: { $sum: 1 } } },
      { $sort: { cnt: -1 } },
      { $limit: 6 },
    ]);

    const topics = genres.map((g) => g._id);
    const curated = ['Unreliable Narrators', 'Climate Fiction', 'Flash Fiction Under 500w', 'Second-Person POV'];
    return [...new Set([...topics, ...curated])].slice(0, 6);
  },
};

function sortToMongoSort(sort: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'most_discussed':
      return { createdAt: -1 };
    case 'highest_rated':
      return { 'ai_critique.scores.plot': -1, createdAt: -1 };
    case 'ai_picks':
      return { 'ai_critique.scores.character': -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}
