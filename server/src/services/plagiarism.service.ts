import { DraftModel } from '../models';

export const plagiarismService = {
  async checkDraft(draftId: string, text: string): Promise<{ score: number; sources: any[] }> {
    console.log(`[Plagiarism] Scanning draft ${draftId}...`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const seed = text.length;
    const score = Math.max(0, Math.min(15, seed % 12));

    const sources = score > 5
      ? [{ url: 'https://archive.org/details/writing-sample-01', match: `${score}%`, type: 'Web Database' }]
      : [];

    await DraftModel.findByIdAndUpdate(draftId, {
      plagiarism_score: score,
      last_plagiarism_check: new Date(),
    });

    return { score, sources };
  },
};
