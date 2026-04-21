import express                from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken }        from '../middleware/auth.js';

const router = express.Router();
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Insight model (JSON mode) ────────────────────────────────────────────────
const insightModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature:      0.7,
    maxOutputTokens:  1000,
  },
});

// ─── Chat model (text mode) ───────────────────────────────────────────────────
const chatModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature:    0.8,
    maxOutputTokens: 600,
  },
});

// ─── POST /api/ai/insight ─────────────────────────────────────────────────────
router.post('/insight', verifyToken, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const prompt = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    const result = await insightModel.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (err) {
    console.error('[Gemini insight error]', err?.message);
    res.status(err?.status ?? 502).json({ message: err?.message ?? 'AI request failed' });
  }
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const systemPrompt = `You are DSA Buddy 🤖, a friendly AI assistant built into DSA&Chill — an AI-powered platform that helps college students master Data Structures & Algorithms.

About the platform:
- Students sync their LeetCode stats automatically
- Teachers assign problem sheets and track class progress
- There's a leaderboard, progress analytics, and AI insights
- Students can also create their own personal practice sheets

Current user info:
- Name: ${userContext?.name ?? 'Student'}
- Role: ${userContext?.role ?? 'student'}
${userContext?.leetcodeUsername ? `- LeetCode: @${userContext.leetcodeUsername}` : ''}
${userContext?.totalSolved != null ? `- Problems solved: ${userContext.totalSolved}` : ''}
${userContext?.rank ? `- Global rank: #${userContext.rank}` : ''}

Your personality:
- Friendly, encouraging, and concise
- Expert in DSA — arrays, trees, graphs, DP, etc.
- Can explain concepts, hint at approaches, review strategies
- Keep responses SHORT (2-4 sentences) unless explaining a concept
- Use emojis occasionally to stay friendly
- If asked something completely off-topic, kindly redirect to DSA/coding

Never give full solution code. Give hints and approaches instead.`;

    // Build Gemini chat history (exclude last message — that's sent via sendMessage)
    const history = [
      {
        role:  'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role:  'model',
        parts: [{ text: `Hey ${userContext?.name?.split(' ')[0] ?? 'there'}! 👋 I'm DSA Buddy — your personal coding coach on DSA&Chill. Ask me anything about algorithms, your LeetCode grind, or how to use the platform! 🚀` }],
      },
      // Previous conversation turns (all except the last user message)
      ...messages.slice(0, -1).map((m) => ({
        role:  m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    const chat   = chatModel.startChat({ history });
    const last   = messages[messages.length - 1];
    const result = await chat.sendMessage(last.content);

    res.json({ text: result.response.text() });
  } catch (err) {
    console.error('[Gemini chat error]', err?.message);
    res.status(err?.status ?? 502).json({ message: err?.message ?? 'Chat request failed' });
  }
});

export default router;