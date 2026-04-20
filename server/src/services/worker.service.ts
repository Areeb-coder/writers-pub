import { aiService } from './ai.service';
import { plagiarismService } from './plagiarism.service';
import { emitToUser, SocketEvents } from '../socket';
import { notificationsService } from './notifications.service';
import { achievementsService } from './achievements.service';
import { DraftModel, UserModel } from '../models';

export const workerService = {
  aiQueue: [] as Array<{ draftId: string; userId: string }>,
  isProcessingAI: false,

  init() {
    console.log('[Worker] Initializing background tasks...');
    setInterval(() => this.processTrustScoreDecay(), 1000 * 60 * 60);
    setInterval(() => this.syncAchievements(), 1000 * 60 * 15);
    console.log('[Worker] Background intervals started');
  },

  async queueAICritique(draftId: string, userId: string) {
    this.aiQueue.push({ draftId, userId });

    await notificationsService.create({
      user_id: userId,
      type: 'system',
      title: 'Analysis Started',
      message: 'Authenticity check and AI critique are being generated...',
      metadata: { draftId },
    });

    this.processAIQueue();
  },

  async processAIQueue() {
    if (this.isProcessingAI || this.aiQueue.length === 0) return;

    this.isProcessingAI = true;
    const job = this.aiQueue.shift();

    if (job) {
      const { draftId, userId } = job;
      try {
        const draft = await DraftModel.findById(draftId).select('content_text').lean();
        const contentText = draft?.content_text || '';

        const [critique] = await Promise.all([
          aiService.generateCritique(draftId),
          plagiarismService.checkDraft(draftId, contentText),
        ]);

        emitToUser(userId, SocketEvents.AI_READY, { draftId, critique });
        emitToUser(userId, SocketEvents.USER_AI_READY, { draftId, critique });

        await notificationsService.create({
          user_id: userId,
          type: 'ai_ready',
          title: 'AI Critique Ready',
          message: `Your analysis for draft is complete with a Plot score of ${critique.scores.plot}/10.`,
          metadata: { draftId, scores: critique.scores },
        });
      } catch (err: any) {
        console.error(`[Worker] AI critique job failed for ${draftId}:`, err.message);
      }
    }

    this.isProcessingAI = false;
    this.processAIQueue();
  },

  async processTrustScoreDecay() {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await UserModel.updateMany(
        { updatedAt: { $lt: cutoff }, trust_score: { $gt: 10 } },
        [{ $set: { trust_score: { $multiply: ['$trust_score', 0.95] } } }]
      );
    } catch (err: any) {
      console.error('[Worker] Trust score decay failed:', err.message);
    }
  },

  async syncAchievements() {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsers = await UserModel.find({ updatedAt: { $gt: cutoff } }).select('_id').lean();
      for (const user of activeUsers) {
        await achievementsService.checkAndUpdate(String(user._id));
      }
    } catch (err: any) {
      console.error('[Worker] Achievement sync failed:', err.message);
    }
  },
};
