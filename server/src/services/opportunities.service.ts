import { AppError } from '../middleware/errorHandler';
import { DraftModel, OpportunityModel, SubmissionModel, UserModel } from '../models';
import { aiService } from './ai.service';

export const opportunitiesService = {
  async list(opts: { genre?: string; isPaid?: boolean; search?: string; userId?: string; page?: number; limit?: number }) {
    const { genre, isPaid, search, userId, page = 1, limit = 20 } = opts;

    const filter: any = { is_active: true };
    if (genre && genre !== 'All') filter.genres = genre;
    if (isPaid !== undefined) filter.is_paid = isPaid;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await OpportunityModel.countDocuments(filter);
    const opportunities = await OpportunityModel.find(filter)
      .sort({ is_featured: -1, deadline: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('publisher_id', 'display_name avatar_url is_verified genres')
      .lean();

    let userGenres: string[] = [];
    if (userId) {
      const user = await UserModel.findById(userId).select('genres').lean();
      userGenres = user?.genres || [];
    }

    const data = await Promise.all(
      opportunities.map(async (opp: any) => {
        const submission_count = await SubmissionModel.countDocuments({ opportunity_id: opp._id });
        return {
          ...mapOpportunity(opp),
          publisher_name: opp.publisher_id?.display_name || 'Unknown',
          publisher_avatar: opp.publisher_id?.avatar_url || null,
          publisher_verified: !!opp.publisher_id?.is_verified,
          submission_count,
          matchScore: userId ? await aiService.getMatchScore(userGenres, String(opp._id)) : undefined,
        };
      })
    );

    return {
      opportunities: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getFeatured() {
    const opp = await OpportunityModel.findOne({ is_featured: true, is_active: true })
      .sort({ createdAt: -1 })
      .populate('publisher_id', 'display_name avatar_url is_verified')
      .lean();

    if (!opp) return null;
    return {
      ...mapOpportunity(opp),
      publisher_name: opp.publisher_id?.display_name || 'Unknown',
      publisher_avatar: opp.publisher_id?.avatar_url || null,
      publisher_verified: !!opp.publisher_id?.is_verified,
      submission_count: await SubmissionModel.countDocuments({ opportunity_id: opp._id }),
    };
  },

  async getById(id: string) {
    const opp = await OpportunityModel.findById(id)
      .populate('publisher_id', 'display_name avatar_url is_verified')
      .lean();

    if (!opp) throw new AppError('Opportunity not found', 404);

    return {
      ...mapOpportunity(opp),
      publisher_name: opp.publisher_id?.display_name || 'Unknown',
      publisher_avatar: opp.publisher_id?.avatar_url || null,
      publisher_verified: !!opp.publisher_id?.is_verified,
      submission_count: await SubmissionModel.countDocuments({ opportunity_id: opp._id }),
    };
  },

  async create(publisherId: string, data: {
    title: string; description?: string; genres?: string[]; deadline?: string;
    word_limit_max?: number; is_paid?: boolean; payment_details?: string; is_featured?: boolean;
  }) {
    const created = await OpportunityModel.create({
      publisher_id: publisherId,
      title: data.title,
      description: data.description,
      genres: data.genres || [],
      deadline: data.deadline ? new Date(data.deadline) : null,
      word_limit_max: data.word_limit_max,
      is_paid: data.is_paid || false,
      payment_details: data.payment_details,
      is_featured: data.is_featured || false,
    });

    return mapOpportunity(created.toJSON());
  },

  async getStats() {
    const open_calls = await OpportunityModel.countDocuments({ is_active: true });
    const total_submissions = await SubmissionModel.countDocuments({});
    const accepted = await SubmissionModel.countDocuments({ status: 'accepted' });
    const acceptance_rate = total_submissions === 0 ? 0 : Math.round((accepted / total_submissions) * 100);

    return {
      open_calls,
      total_submissions,
      acceptance_rate,
      avg_match: 76,
    };
  },

  async getMatchesForDraft(draftId: string, userId: string) {
    const draft = await DraftModel.findById(draftId).select('author_id genre').lean();
    if (!draft) {
      throw new AppError('Draft not found', 404);
    }
    if (String(draft.author_id) !== userId) {
      throw new AppError('You can only fetch matches for your own drafts', 403);
    }

    const opportunities = await this.list({
      genre: draft.genre || undefined,
      userId,
      limit: 50,
      page: 1,
    });

    return opportunities.opportunities
      .map((opp: any) => ({
        ...opp,
        matchScore: opp.matchScore ?? 50,
      }))
      .sort((a: any, b: any) => b.matchScore - a.matchScore);
  },
};

function mapOpportunity(opp: any) {
  return {
    ...opp,
    id: opp.id || String(opp._id),
    publisher_id: String(opp.publisher_id?._id || opp.publisher_id),
    created_at: opp.created_at || opp.createdAt,
    updated_at: opp.updated_at || opp.updatedAt,
  };
}
