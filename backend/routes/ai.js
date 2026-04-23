import express                from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken }        from '../middleware/auth.js';

const router = express.Router();
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Model fallback chain ─────────────────────────────────────────────────────
// If 2.5-flash is overloaded → try 1.5-flash → try 1.0-pro
// All free tier. All capable enough for our prompts.
const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',   // lightest model, almost never rate-limited
];

// ─── In-memory server-side response cache ────────────────────────────────────
// Key = hash of prompt, Value = { text, ts }
// Prevents hammering the API with identical prompts during a demo session
const SERVER_CACHE     = new Map();
const SERVER_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const getCached = (key) => {
  const hit = SERVER_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > SERVER_CACHE_TTL) { SERVER_CACHE.delete(key); return null; }
  return hit.text;
};
const setCache = (key, text) => {
  // Keep cache from growing unbounded — evict oldest if > 50 entries
  if (SERVER_CACHE.size >= 50) {
    const firstKey = SERVER_CACHE.keys().next().value;
    SERVER_CACHE.delete(firstKey);
  }
  SERVER_CACHE.set(key, { text, ts: Date.now() });
};

// Simple string hash for cache key
const hashStr = (str) => {
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 500); i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return String(h);
};

// ─── Core: try models in order with retry ────────────────────────────────────
const generateWithFallback = async (prompt, jsonMode = false, maxRetries = 2) => {
  let lastError;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature:      0.7,
            maxOutputTokens:  2500,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        });

        const result = await model.generateContent(prompt);
        const text   = result.response.text();
        console.log(`✅ [AI] Success with ${modelName} (attempt ${attempt + 1})`);
        return { text, model: modelName };

      } catch (err) {
        lastError = err;
        const msg    = err?.message ?? '';
        const status = err?.status  ?? 0;

        // Retryable errors: 503 overloaded, 429 rate limit, 500 server error
        const isRetryable = status === 503 || status === 429 || status === 500
          || msg.includes('503') || msg.includes('429')
          || msg.includes('overloaded') || msg.includes('high demand')
          || msg.includes('quota') || msg.includes('rate')
          || msg.includes('Service Unavailable');

        if (!isRetryable) {
          // Non-retryable (bad prompt, auth error) — skip retries for this model
          console.warn(`⚠️  [AI] Non-retryable error on ${modelName}: ${msg}`);
          break;
        }

        if (attempt < maxRetries) {
          // Exponential backoff: 1s → 2s → 4s (capped at 4s for demo UX)
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
          console.warn(`⏳ [AI] ${modelName} attempt ${attempt + 1} failed (${status}). Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          console.warn(`❌ [AI] ${modelName} exhausted after ${maxRetries + 1} attempts. Trying next model...`);
        }
      }
    }
  }

  // All models failed
  throw lastError ?? new Error('All Gemini models are currently unavailable');
};

// ─── POST /api/ai/insight ─────────────────────────────────────────────────────
// Used for structured JSON insights (student + teacher panels)
router.post('/insight', verifyToken, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const prompt   = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
    const cacheKey = `insight_${hashStr(prompt)}`;

    // Check server cache first
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('⚡ [AI] Serving insight from server cache');
      return res.json({ text: cached, cached: true });
    }

    const { text, model } = await generateWithFallback(prompt, true);
    
    let cleanText = text.replace(/```json|```/g, '').trim();
    try {
      JSON.parse(cleanText); // Test if it's completely valid JSON
      
      // If valid, save to cache and send to frontend
      setCache(cacheKey, cleanText);
      res.json({ text: cleanText, model });
    } catch (parseErr) {
      console.error('[AI] Model returned invalid/cut-off JSON:', cleanText);
      // Don't cache it! Throw 500 so frontend can retry
      return res.status(500).json({ 
        message: 'AI generated incomplete data due to load. Please refresh to try again.',
        retryable: true
      });
    }

  } catch (err) {
    console.error('[AI /insight error]', err?.message);
    res.status(503).json({
      message: 'AI service temporarily unavailable. Please try again in a moment.',
      retryable: true,
    });
  }
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Conversational chatbot — NOT cached (each message is unique)
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const isTeacher = userContext?.role === 'teacher';

    const systemPrompt = `You are DSA Buddy 🤖, a friendly AI assistant built into DSA&Chill — an AI-powered platform that helps college students master Data Structures & Algorithms.

About the platform:
- Students sync their LeetCode stats automatically
- Teachers assign problem sheets and track class progress
- There's a leaderboard, progress analytics, and AI insights
- Students can also create their own personal practice sheets

Current user:
- Name: ${userContext?.name ?? (isTeacher ? 'Professor' : 'Student')}
- Role: ${userContext?.role ?? 'student'}
${userContext?.leetcodeUsername ? `- LeetCode: @${userContext.leetcodeUsername}` : ''}
${userContext?.totalSolved != null ? `- Problems solved: ${userContext.totalSolved} (E:${userContext.easySolved} M:${userContext.mediumSolved} H:${userContext.hardSolved})` : ''}
${userContext?.ranking ? `- Global rank: #${userContext.ranking}` : ''}
${isTeacher ? `- Class code: ${userContext?.myClassCode ?? 'N/A'}` : ''}

Your personality:
- Friendly, encouraging, and concise
- Expert in DSA — arrays, trees, graphs, DP, sliding window, etc.
- Keep responses SHORT (2-4 sentences) unless explaining a concept
- Use **bold** for key terms, \`code\` for code snippets
- If asked off-topic, kindly redirect to DSA/coding/the platform
- Never give full solutions — give hints and approaches`;

    const history = [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: `Hey ${userContext?.name?.split(' ')[0] ?? 'there'}! 👋 Ready to help with DSA, interviews, or the platform. What's on your mind?` }] },
      ...messages.slice(0, -1).map(m => ({
        role:  m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    const last = messages[messages.length - 1];

    // Chat uses a slightly different approach — we build the full prompt
    // to work with generateWithFallback (simpler than startChat across models)
    const chatPrompt = [
      systemPrompt,
      '',
      '--- Conversation so far ---',
      ...messages.slice(0, -1).map(m => `${m.role === 'user' ? 'User' : 'DSA Buddy'}: ${m.content}`),
      '',
      `User: ${last.content}`,
      '',
      'DSA Buddy:',
    ].join('\n');

    const { text } = await generateWithFallback(chatPrompt, false, 1); // 1 retry for chat (faster UX)
    res.json({ text });

  } catch (err) {
    console.error('[AI /chat error]', err?.message);
    // For chat, return a graceful in-conversation error message
    res.json({
      text: "I'm having a bit of trouble connecting right now 🙏 Please try again in a few seconds — the AI service is under high load.",
    });
  }
});

// ─── GET /api/ai/status — health check for frontend ──────────────────────────
router.get('/status', verifyToken, async (req, res) => {
  res.json({
    cacheSize:   SERVER_CACHE.size,
    models:      MODEL_CHAIN,
    cacheMaxAge: `${SERVER_CACHE_TTL / 3600000}h`,
  });
});

export default router;