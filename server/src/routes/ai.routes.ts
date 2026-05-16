import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const router = Router();
const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

router.post('/brainstorm', authenticate, async (req, res, next) => {
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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: "You are an expert creative writing assistant, world-builder, and brainstorming partner for novelists. Help the user brainstorm ideas, develop characters, outline plots, or map out magic systems. Be encouraging, creative, and provide structured, detailed responses. Do not write the story for them, but rather act as a sounding board and ideation tool.",
    });
    
    // Format history for Gemini chat if provided
    let rawHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : [];

    // Sanitize history to ensure it strictly alternates and starts with 'user'
    let formattedHistory: any[] = [];
    let nextExpectedRole = 'user';
    for (const msg of rawHistory) {
      if (msg.role === nextExpectedRole) {
        formattedHistory.push(msg);
        nextExpectedRole = nextExpectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Gemini startChat requires the last message in history to be 'model' before the next 'user' prompt
    // If the sanitized history ends with 'user', we must remove it to maintain strict alternating structure
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }

    const chat = model.startChat({
      history: formattedHistory,
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
