import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const router = Router();
const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

router.post('/brainstorm', requireAuth, async (req, res, next) => {
  try {
    if (!genAI) {
      res.status(503).json({ success: false, message: 'AI service is currently unavailable.' });
      return;
    }

    const { prompt, history } = req.body;
    
    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required.' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-05-06' });
    
    // Format history for Gemini chat if provided
    const chat = model.startChat({
      history: history ? history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) : [],
      systemInstruction: "You are an expert creative writing assistant, world-builder, and brainstorming partner for novelists. Help the user brainstorm ideas, develop characters, outline plots, or map out magic systems. Be encouraging, creative, and provide structured, detailed responses. Do not write the story for them, but rather act as a sounding board and ideation tool.",
    });

    const result = await chat.sendMessage(prompt);
    const text = result.response.text();

    res.json({
      success: true,
      data: {
        response: text
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
