import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const CLAUDE_MODEL  = 'claude-sonnet-4-20250514';
const CLAUDE_URL    = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS    = 1000;

// ─── Build the prompt for student insights ────────────────────────────────────
const buildStudentPrompt = (stats, username) => `
You are an expert DSA (Data Structures & Algorithms) coach analyzing a LeetCode user's performance.

Student LeetCode username: ${username ?? 'Unknown'}
Total Solved: ${stats.totalSolved}
Easy Solved: ${stats.easySolved}
Medium Solved: ${stats.mediumSolved}
Hard Solved: ${stats.hardSolved}
Acceptance Rate: ${stats.acceptanceRate}%
Global Ranking: #${stats.ranking?.toLocaleString() ?? 'N/A'}
Top Topics (solved count): ${
  Object.entries(stats.topicStats instanceof Map
    ? Object.fromEntries(stats.topicStats)
    : stats.topicStats ?? {}
  ).sort((a, b) => b[1] - a[1]).slice(0, 8)
   .map(([t, c]) => `${t}(${c})`).join(', ') || 'None yet'
}
Recent Submissions (last 5): ${
  (stats.recentSubmissions ?? []).slice(0, 5).map(s => s.title).join(', ') || 'None'
}

Give exactly 3 concise, actionable insights (each 1–2 sentences). Focus on:
1. Biggest strength to leverage
2. Most critical weakness to fix NOW
3. A concrete next-step challenge or pattern to study this week

Format: Return only a JSON array of 3 strings. No preamble, no markdown, no extra keys.
Example: ["Insight 1...", "Insight 2...", "Insight 3..."]
`.trim();

const buildTeacherPrompt = (classData, topicData) => {
  const avgSolved = classData.length
    ? Math.round(classData.reduce((s, d) => s + (d.leetcode?.totalSolved ?? 0), 0) / classData.length)
    : 0;
  const weakTopics  = [...topicData].sort((a, b) => a.avg - b.avg).slice(0, 3).map(t => t.topic);
  const strongTopics = [...topicData].sort((a, b) => b.avg - a.avg).slice(0, 3).map(t => t.topic);
  const unsyncedCount = classData.filter(d => !d.leetcode?.lastSynced).length;

  return `
You are an expert DSA instructor analyzing class performance data.

Class Size: ${classData.length} students
Average Problems Solved: ${avgSolved}
Students Not Yet Synced: ${unsyncedCount}
Weakest Topics (lowest avg): ${weakTopics.join(', ') || 'N/A'}
Strongest Topics (highest avg): ${strongTopics.join(', ') || 'N/A'}

Give exactly 3 actionable class-level insights for the teacher. Focus on:
1. What the class is doing well
2. The single most urgent topic to address in the next lecture/lab
3. A concrete action (e.g. create a sheet, hold office hours, challenge top performers)

Format: Return only a JSON array of 3 strings. No preamble, no markdown, no extra keys.
Example: ["Insight 1...", "Insight 2...", "Insight 3..."]
`.trim();
};

// ─── Typed text effect ────────────────────────────────────────────────────────
function TypedText({ text, delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text}
    </motion.span>
  );
}

// ─── Main ClaudeInsight component ─────────────────────────────────────────────
export default function ClaudeInsight({
  mode        = 'student',    // 'student' | 'teacher'
  stats       = null,         // for student mode
  username    = '',
  classData   = [],           // for teacher mode
  topicData   = [],
  compact     = false,
}) {
  const [insights,  setInsights]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [expanded,  setExpanded]  = useState(true);

  const fetchInsights = useCallback(async () => {
    if (mode === 'student' && !stats) {
      toast.error('Sync your LeetCode first to get AI insights!');
      return;
    }
    if (mode === 'teacher' && !classData.length) {
      toast.error('No class data available yet.');
      return;
    }

    setLoading(true);
    setError(null);
    setInsights(null);

    const prompt = mode === 'student'
      ? buildStudentPrompt(stats, username)
      : buildTeacherPrompt(classData, topicData);

    try {
// In ClaudeInsight.jsx — production-safe version
const response = await fetch('/api/ai/insight', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('dac_token')}`,
  },
  body: JSON.stringify({
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  }),
});

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? `API error ${response.status}`);
      }

      const data = await response.json();
      const raw  = data.content?.find(b => b.type === 'text')?.text ?? '[]';

      // Strip markdown fences if model wraps in them
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Unexpected response shape');
      setInsights(parsed);
    } catch (err) {
      console.error('[Claude insight error]', err);
      setError(err.message || 'Failed to get insights');
      toast.error('AI insights failed — check console');
    } finally {
      setLoading(false);
    }
  }, [mode, stats, username, classData, topicData]);

  const icons = ['💡', '🎯', '🚀'];
  const colors = ['var(--easy)', 'var(--medium)', 'var(--accent)'];

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <Brain size={12} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-xs font-code font-medium" style={{ color: 'var(--accent)' }}>
            Claude AI · {mode === 'student' ? 'Personal' : 'Class'} Insights
          </span>
        </div>

        <div className="flex items-center gap-2">
          {insights && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setExpanded(v => !v)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </motion.button>
          )}
          <motion.button
            onClick={fetchInsights}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
            style={{
              background:  insights ? 'transparent' : 'var(--accent)',
              color:       insights ? 'var(--accent)' : '#0a0a0f',
              border:      insights ? '1px solid var(--accent)' : 'none',
            }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={10} />
                </motion.div>
                Thinking...
              </>
            ) : insights ? (
              <><RefreshCw size={10} /> Refresh</>
            ) : (
              <><Sparkles size={10} /> Get Insights</>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!insights && !loading && !error && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl text-xs leading-relaxed text-center"
            style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-2)', color: 'var(--text-muted)' }}
          >
            <Zap size={16} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            Click <strong style={{ color: 'var(--text-secondary)' }}>Get Insights</strong> to have Claude analyze{' '}
            {mode === 'student' ? 'your LeetCode performance' : 'your class data'} and give you actionable coaching.
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl skeleton"
                   style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            <p className="text-center text-xs font-code pt-1" style={{ color: 'var(--text-muted)' }}>
              Claude is analyzing your data...
            </p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl text-xs"
            style={{ background: 'var(--hard-bg)', border: '1px solid var(--hard)', color: 'var(--hard)' }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {insights && !loading && expanded && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${compact ? '' : 'space-y-1'}`}
                style={{
                  background: 'var(--bg-2)',
                  border: `1px solid ${colors[i]}25`,
                  borderLeft: `3px solid ${colors[i]}`,
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="mr-1.5">{icons[i]}</span>
                <TypedText text={insight} delay={i * 0.12 + 0.1} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}