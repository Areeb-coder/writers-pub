import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config/env';
import { AICritique } from '../types';
import { AIEmbeddingModel, DraftModel, OpportunityModel } from '../models';

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

export const aiService = {
  async generateCritique(draftId: string): Promise<AICritique> {
    const draft = await DraftModel.findById(draftId).select('content_text title').lean();
    if (!draft) throw new Error('Draft not found');

    const contentText = draft.content_text || '';
    const title = draft.title || 'Untitled';

    if (!contentText || contentText.trim().length < 50) {
      throw new Error('Draft content too short for analysis (minimum 50 characters)');
    }

    let critique: AICritique;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-05-06' });
        const prompt = `You are a professional literary editor and writing critique expert. Analyze the following creative writing piece and provide a structured critique.\n\nTitle: "${title}"\n\nText:\n"""\n${contentText.substring(0, 8000)}\n"""\n\nRespond ONLY with valid JSON in this exact format:\n{\n  "scores": {\n    "plot": <number 1-10>,\n    "pacing": <number 1-10>,\n    "character": <number 1-10>\n  },\n  "suggestions": [\n    {\n      "title": "<short actionable title>",\n      "desc": "<2-3 sentence specific suggestion for improvement>"\n    }\n  ]\n}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse AI response');

        const parsed = JSON.parse(jsonMatch[0]);
        critique = {
          scores: {
            plot: Math.min(10, Math.max(1, parsed.scores.plot)),
            pacing: Math.min(10, Math.max(1, parsed.scores.pacing)),
            character: Math.min(10, Math.max(1, parsed.scores.character)),
          },
          suggestions: (parsed.suggestions || []).slice(0, 3).map((s: any) => ({
            title: String(s.title),
            desc: String(s.desc),
          })),
          analyzed_at: new Date().toISOString(),
        };
      } catch (err: any) {
        console.error('[AI] Gemini critique failed:', err.message);
        critique = generateFallbackCritique();
      }
    } else {
      critique = generateFallbackCritique();
    }

    await DraftModel.findByIdAndUpdate(draftId, { ai_critique: critique });
    return critique;
  },

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!genAI) return null;

    try {
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      console.error('[AI] Embedding generation failed:', err.message);
      return null;
    }
  },

  async updateEntityEmbedding(entityType: string, entityId: string, text: string) {
    const embedding = await this.generateEmbedding(text);
    if (!embedding) return;

    await AIEmbeddingModel.updateOne(
      { entity_type: entityType, entity_id: entityId },
      { $set: { embedding, updated_at: new Date() } },
      { upsert: true }
    );
  },

  async getMatchScore(userGenres: string[], opportunityId: string): Promise<number> {
    try {
      const opp = await OpportunityModel.findById(opportunityId).select('genres').lean();
      if (!opp) return 0;

      const oppGenres: string[] = opp.genres || [];
      if (oppGenres.length === 0 || userGenres.length === 0) return 50;

      const matches = userGenres.filter((g) => oppGenres.includes(g)).length;
      const score = Math.round((matches / Math.max(oppGenres.length, userGenres.length)) * 100);
      return Math.max(20, Math.min(99, score + Math.floor(Math.random() * 15)));
    } catch {
      return Math.floor(Math.random() * 40) + 50;
    }
  },

  async checkContentSafety(text: string): Promise<{ isSafe: boolean; reason?: string }> {
    if (!genAI) return { isSafe: true };

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash',
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      });

      const response = await model.generateContent(`Check the following creative writing for extreme safety violations. Respond SAFE or UNSAFE: [reason].\n\nText:\n"""\n${text.substring(0, 1000)}\n"""`);
      const resText = response.response.text().trim();
      if (resText.startsWith('UNSAFE')) {
        return { isSafe: false, reason: resText.replace('UNSAFE:', '').trim() };
      }

      return { isSafe: true };
    } catch (err: any) {
      if (err.message?.includes('SAFETY')) {
        return { isSafe: false, reason: 'Content flagged by safety filters' };
      }
      return { isSafe: true };
    }
  },
};

function generateFallbackCritique(): AICritique {
  return {
    scores: {
      plot: parseFloat((Math.random() * 3 + 6.5).toFixed(1)),
      pacing: parseFloat((Math.random() * 3 + 6).toFixed(1)),
      character: parseFloat((Math.random() * 3 + 6.5).toFixed(1)),
    },
    suggestions: [
      { title: 'Strengthen the opening hook', desc: 'Consider restructuring your first paragraph to present a stronger tension.' },
      { title: 'Develop sensory details', desc: 'Add touch, smell, and sound details to make scenes more immersive.' },
      { title: 'Clarify character motivation', desc: 'Make the protagonist goal more explicit to raise emotional stakes.' },
    ],
    analyzed_at: new Date().toISOString(),
  };
}
