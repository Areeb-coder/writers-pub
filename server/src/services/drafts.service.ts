import { AppError } from '../middleware/errorHandler';
import { DraftStatus, DraftVisibility, UserRole } from '../types';
import { aiService } from './ai.service';
import { workerService } from './worker.service';
import { DraftModel, DraftVersionModel, isValidObjectId, normalize, toObjectId } from '../models';

export const draftsService = {
  async create(authorId: string, data: { title: string; genre?: string; content?: any; tags?: string[] }) {
    if (!isValidObjectId(authorId)) throw new AppError('Invalid author', 400);

    const contentText = data.content ? extractText(data.content) : '';
    const wordCount = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
    const tags = (data.tags || []).map((tag) => tag.trim()).filter(Boolean).slice(0, 12);

    const draftDoc = await DraftModel.create({
      author_id: toObjectId(authorId),
      title: data.title,
      genre: data.genre || null,
      content: data.content || {},
      content_text: contentText,
      word_count: wordCount,
      tags,
    });

    const draft = normalize(draftDoc);
    workerService.queueAICritique(draft.id, authorId).catch(() => undefined);
    return mapDraft(draft);
  },

  async list(authorId: string, opts: { search?: string; status?: string; genre?: string; page?: number; limit?: number }) {
    const { search, status, genre, page = 1, limit = 20 } = opts;
    const filter: any = { author_id: toObjectId(authorId) };

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (genre) filter.genre = genre;

    const total = await DraftModel.countDocuments(filter);
    const drafts = await DraftModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      drafts: drafts.map((d) => mapDraft(d)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(draftId: string, userId?: string, userRole?: UserRole) {
    if (!isValidObjectId(draftId)) throw new AppError('Draft not found', 404);

    const draft = await DraftModel.findById(draftId).lean();
    if (!draft) {
      throw new AppError('Draft not found', 404);
    }

    const ownerId = String(draft.author_id);
    if (draft.visibility === 'private' && ownerId !== userId) {
      throw new AppError('Access denied', 403);
    }
    if (draft.visibility === 'editors_only' && ownerId !== userId && userRole !== 'editor' && userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    return mapDraft(draft);
  },

  async update(draftId: string, authorId: string, data: { title?: string; content?: any; genre?: string; tags?: string[]; progress?: number; status?: DraftStatus }) {
    if (!isValidObjectId(draftId) || !isValidObjectId(authorId)) {
      throw new AppError('Draft not found or access denied', 404);
    }

    const existing = await DraftModel.findOne({ _id: draftId, author_id: authorId });
    if (!existing) {
      throw new AppError('Draft not found or access denied', 404);
    }

    if (data.content !== undefined) {
      await DraftVersionModel.create({
        draft_id: existing._id,
        content: existing.content,
        content_text: existing.content_text || '',
        word_count: existing.word_count || 0,
        version_number: existing.version || 1,
      });
    }

    if (data.title !== undefined) existing.title = data.title;
    if (data.genre !== undefined) existing.genre = data.genre;
    if (data.tags !== undefined) existing.tags = data.tags.map((t) => t.trim()).filter(Boolean).slice(0, 12);
    if (data.progress !== undefined) existing.progress = data.progress;
    if (data.status !== undefined) existing.status = data.status;

    if (data.content !== undefined) {
      existing.content = data.content;
      const contentText = extractText(data.content);
      existing.content_text = contentText;
      existing.word_count = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
      existing.version = (existing.version || 1) + 1;
    }

    await existing.save();
    return mapDraft(normalize(existing));
  },

  async delete(draftId: string, authorId: string) {
    const deleted = await DraftModel.findOneAndDelete({ _id: draftId, author_id: authorId });
    if (!deleted) {
      throw new AppError('Draft not found or access denied', 404);
    }
    return { id: draftId };
  },

  async share(draftId: string, authorId: string, visibility: DraftVisibility) {
    const draft = await DraftModel.findOne({ _id: draftId, author_id: authorId });
    if (!draft) {
      throw new AppError('Draft not found or access denied', 404);
    }

    const status = visibility === 'public' ? 'shared' : 'draft';
    if (visibility === 'public') {
      const safety = await aiService.checkContentSafety(draft.content_text || '');
      if (!safety.isSafe) {
        throw new AppError(`Public share denied: ${safety.reason}`, 400);
      }
    }

    draft.visibility = visibility;
    draft.status = status as DraftStatus;
    await draft.save();

    return { id: draft.id, visibility: draft.visibility, status: draft.status };
  },

  async getHistory(draftId: string, userId: string, userRole: UserRole) {
    await this.getById(draftId, userId, userRole);

    const versions = await DraftVersionModel.find({ draft_id: draftId })
      .sort({ version_number: -1 })
      .limit(20)
      .lean();

    return versions.map((v) => ({
      id: String(v._id),
      version_number: v.version_number,
      word_count: v.word_count,
      created_at: v.createdAt,
    }));
  },

  async getStats(authorId: string) {
    const drafts = await DraftModel.find({ author_id: authorId }).lean();

    const total_drafts = drafts.length;
    const total_words = drafts.reduce((sum, d) => sum + (d.word_count || 0), 0);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const lastWeekWords = drafts
      .filter((d) => new Date(d.updatedAt).getTime() > weekAgo)
      .reduce((sum, d) => sum + (d.word_count || 0), 0);

    const prevWeekWords = drafts
      .filter((d) => {
        const ts = new Date(d.updatedAt).getTime();
        return ts <= weekAgo && ts > twoWeeksAgo;
      })
      .reduce((sum, d) => sum + (d.word_count || 0), 0);

    const weekly_growth_pct = prevWeekWords === 0 ? 0 : Math.round(((lastWeekWords / prevWeekWords) - 1) * 100);

    return {
      total_drafts,
      total_words,
      avg_session_minutes: 0,
      weekly_growth_pct,
    };
  },
};

function mapDraft(d: any) {
  return {
    ...d,
    id: d.id || String(d._id),
    author_id: String(d.author_id),
    created_at: d.created_at || d.createdAt,
    updated_at: d.updated_at || d.updatedAt,
  };
}

function extractText(content: any): string {
  if (typeof content === 'string') return content;
  if (!content) return '';

  let text = '';
  if (content.text) text += content.text;
  if (content.content && Array.isArray(content.content)) {
    for (const child of content.content) {
      text += extractText(child);
      if (child.type === 'paragraph' || child.type === 'heading') {
        text += '\n';
      }
    }
  }
  return text.trim();
}
