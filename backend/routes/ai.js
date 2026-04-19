import express                from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken }        from '../middleware/auth.js';

const router = express.Router();

// Initialise Gemini client once at module load
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',

  // Force JSON output every time — no markdown fences, no preamble
  generationConfig: {
    responseMimeType: 'application/json',
    temperature:      0.7,   // balanced creativity vs. consistency
    maxOutputTokens:  1000,
  },
});

// ─── POST /api/ai/insight ─────────────────────────────────────────────────────
// Body: { messages: [{ role: 'user', content: 'prompt string' }] }
// Returns: { text: '["insight1","insight2","insight3"]' }
router.post('/insight', verifyToken, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    // Extract the last user message as the prompt
    // (our frontend always sends a single user message)
    const prompt = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    if (!prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is empty' });
    }

    // Call Gemini
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    // Return in a shape the frontend already knows how to parse
    res.json({ text });
  } catch (err) {
    console.error('[Gemini error]', err?.message ?? err);

    // Surface Gemini quota/auth errors clearly
    const status  = err?.status ?? 502;
    const message = err?.message ?? 'Gemini API request failed';
    res.status(status).json({ message });
  }
});

export default router;