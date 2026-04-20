import { DraftModel, UserModel, WritingSessionModel } from '../models';

export const analyticsService = {
  async getWritingAnalytics(userId: string) {
    const sessions = await WritingSessionModel.find({ user_id: userId, ended_at: { $ne: null } }).lean();

    const total_sessions = sessions.length;
    const total_session_words = sessions.reduce((sum, s: any) => sum + (s.words_written || 0), 0);
    const avg_session_minutes = total_sessions
      ? Number((sessions.reduce((sum, s: any) => {
          const end = new Date(s.ended_at).getTime();
          const start = new Date(s.started_at || s.createdAt).getTime();
          return sum + (end - start) / 60000;
        }, 0) / total_sessions).toFixed(1))
      : 0;

    const drafts = await DraftModel.find({ author_id: userId, updatedAt: { $gt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } })
      .select('word_count updatedAt')
      .lean();

    const weeklyMap = new Map<string, number>();
    for (const d of drafts) {
      const date = new Date(d.updatedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString();
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + (d.word_count || 0));
    }

    const weekly_words = [...weeklyMap.entries()]
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, words]) => ({ week, words }));

    const user = await UserModel.findById(userId).select('streak_days streak_last').lean();

    return {
      sessions: { total_sessions, avg_session_minutes, total_session_words },
      weekly_words,
      streak: { streak_days: user?.streak_days || 0, streak_last: user?.streak_last || null },
    };
  },

  async startSession(userId: string, draftId?: string) {
    const created = await WritingSessionModel.create({
      user_id: userId,
      draft_id: draftId || null,
      started_at: new Date(),
    });
    return { id: created.id, started_at: created.started_at };
  },

  async endSession(sessionId: string, userId: string, wordsWritten: number = 0) {
    const session = await WritingSessionModel.findOneAndUpdate(
      { _id: sessionId, user_id: userId },
      { ended_at: new Date(), words_written: wordsWritten },
      { new: true }
    ).lean();

    if (session) {
      await updateStreak(userId);
      return {
        ...session,
        id: String(session._id),
        user_id: String(session.user_id),
        draft_id: session.draft_id ? String(session.draft_id) : null,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      };
    }

    return null;
  },
};

async function updateStreak(userId: string) {
  const user = await UserModel.findById(userId).select('streak_last streak_days trust_score');
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last = user.streak_last ? new Date(user.streak_last) : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (last && last.getTime() === today.getTime()) return;

  if (last && last.getTime() === yesterday.getTime()) {
    user.streak_days = (user.streak_days || 0) + 1;
    user.streak_last = today;
    if (user.streak_days % 7 === 0) {
      user.trust_score = (user.trust_score || 0) + 5;
    }
  } else {
    user.streak_days = 1;
    user.streak_last = today;
  }

  await user.save();
}
