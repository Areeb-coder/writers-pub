import { AchievementModel, DraftModel, FeedbackModel, SubmissionModel, UserAchievementModel, UserModel, toObjectId } from '../models';

const ACHIEVEMENT_DEFINITIONS = [
  { key: 'first_draft', title: 'First Draft', description: 'Created your first draft', icon: 'Edit3', requirement_value: 1 },
  { key: '10_reviews', title: '10 Reviews', description: 'Gave 10 structured reviews', icon: 'Star', requirement_value: 10 },
  { key: '7_day_streak', title: '7-Day Streak', description: 'Wrote for 7 consecutive days', icon: 'Flame', requirement_value: 7 },
  { key: 'published_author', title: 'Published Author', description: 'First work accepted for publication', icon: 'Crown', requirement_value: 1 },
  { key: 'community_pillar', title: 'Community Pillar', description: '50 helpful reviews', icon: 'Heart', requirement_value: 50 },
  { key: 'trusted_critic', title: 'Trusted Critic', description: 'Trust Score above 900', icon: 'Shield', requirement_value: 900 },
  { key: 'prolific_writer', title: 'Prolific Writer', description: 'Written over 200,000 words', icon: 'Zap', requirement_value: 200000 },
  { key: 'sharpshooter', title: 'Sharpshooter', description: '100% acceptance rate on submissions', icon: 'Target', requirement_value: 100 },
];

export const achievementsService = {
  async seedAchievements() {
    for (const ach of ACHIEVEMENT_DEFINITIONS) {
      await AchievementModel.updateOne({ key: ach.key }, { $setOnInsert: ach }, { upsert: true });
    }
  },

  async getUserAchievements(userId: string) {
    await this.seedAchievements();

    const achievements = await AchievementModel.find({}).sort({ title: 1 }).lean();
    const userAchievements = await UserAchievementModel.find({ user_id: userId }).lean();
    const uaMap = new Map(userAchievements.map((ua: any) => [String(ua.achievement_id), ua]));

    return achievements.map((a: any) => {
      const ua = uaMap.get(String(a._id));
      return {
        id: String(a._id),
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        requirement_value: a.requirement_value,
        progress: ua?.progress || 0,
        earned: ua?.earned || false,
        earned_at: ua?.earned_at || null,
      };
    });
  },

  async checkAndUpdate(userId: string) {
    await this.seedAchievements();

    const [user, draft_count, review_count, accepted_count, helpful_reviews, totalWordsAgg, submissionsTotal] = await Promise.all([
      UserModel.findById(userId).select('streak_days trust_score').lean(),
      DraftModel.countDocuments({ author_id: userId }),
      FeedbackModel.countDocuments({ reviewer_id: userId }),
      SubmissionModel.countDocuments({ submitter_id: userId, status: 'accepted' }),
      FeedbackModel.countDocuments({ reviewer_id: userId, helpfulness_score: { $gte: 4 } }),
      DraftModel.aggregate([{ $match: { author_id: toObjectId(userId) } }, { $group: { _id: null, words: { $sum: '$word_count' } } }]),
      SubmissionModel.countDocuments({ submitter_id: userId }),
    ]);

    const acceptedRate = submissionsTotal === 0 ? 0 : Math.round((accepted_count / submissionsTotal) * 100);

    const progressMap: Record<string, number> = {
      first_draft: draft_count,
      '10_reviews': review_count,
      '7_day_streak': user?.streak_days || 0,
      published_author: accepted_count,
      community_pillar: helpful_reviews,
      trusted_critic: Math.round(user?.trust_score || 0),
      prolific_writer: totalWordsAgg[0]?.words || 0,
      sharpshooter: acceptedRate,
    };

    const achievements = await AchievementModel.find({}).lean();
    for (const ach of achievements) {
      const progress = progressMap[ach.key] || 0;
      const earned = progress >= ach.requirement_value;

      const existing = await UserAchievementModel.findOne({ user_id: userId, achievement_id: ach._id });
      const earned_at = earned && !existing?.earned ? new Date() : existing?.earned_at || null;

      await UserAchievementModel.updateOne(
        { user_id: userId, achievement_id: ach._id },
        { $set: { progress, earned, earned_at } },
        { upsert: true }
      );
    }
  },
};
