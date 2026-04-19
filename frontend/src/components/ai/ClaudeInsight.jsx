import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { aiAPI } from '@/api';
import toast from 'react-hot-toast';

// ─── Prompt builders ──────────────────────────────────────────────────────────

const buildStudentPrompt = (stats, username) => `
You are an expert DSA (Data Structures & Algorithms) coach analyzing a LeetCode user's performance.

Student: ${username ?? 'Unknown'}
Total Solved: ${stats.totalSolved} | Easy: ${stats.easySolved} | Medium: ${stats.mediumSolved} | Hard: ${stats.hardSolved}
Acceptance Rate: ${stats.acceptanceRate}% | Global Rank: #${stats.ranking?.toLocaleString() ?? 'N/A'}
Top Topics (solved count): ${
  Object.entries(
    stats.topicStats instanceof Map
      ? Object.fromEntries(stats.topicStats)
      : stats.topicStats ?? {}
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t, c]) => `${t}(${c})`)
    .join(', ') || 'None yet'
}
Recent Submissions (last 5): ${
  (stats.recentSubmissions ?? [])
    .slice(0, 5)
    .map((s) => s.title)
    .join(', ') || 'None'
}

Task: Give exactly 3 concise, actionable coaching insights (1-2 sentences each).
Rules:
- Return ONLY a valid JSON array of exactly 3 strings.
- No markdown, no code fences, no explanation outside the array.
- Each insight must be specific to this student's actual numbers.

Example output:
["Insight about strength...", "Insight about weakness...", "Concrete next step..."]
`.trim();

const buildTeacherPrompt = (classData, topicData) => {
  const synced  = classData.filter((d) => d.leetcode?.lastSynced);
  const avgSolved = synced.length
    ? Math.round(
        synced.reduce((s, d) => s + (d.leetcode?.totalSolved ?? 0), 0) /
          synced.length
      )
    : 0;
  const weakTopics   = [...topicData].sort((a, b) => a.avg - b.avg).slice(0, 3).map((t) => t.topic);
  const strongTopics = [...topicData].sort((a, b) => b.avg - a.avg).slice(0, 3).map((t) => t.topic);

  return `
You are an expert DSA instructor reviewing class-level performance data.

Class Size: ${classData.length} students | Synced: ${synced.length}
Average Problems Solved per Student: ${avgSolved}
Weakest Topics (lowest avg solved): ${weakTopics.join(', ') || 'N/A'}
Strongest Topics (highest avg solved): ${strongTopics.join(', ') || 'N/A'}

Task: Give exactly 3 actionable class-level coaching insights for the teacher.
Rules:
- Return ONLY a valid JSON array of exactly 3 strings.
- No markdown, no code fences, no explanation outside the array.
- Be specific — reference the actual weak/strong topics by name.

Example output:
["Class strength insight...", "Urgent topic to address...", "Concrete action to take..."]
`.trim();
};

// ─── Gemini branding colors ───────────────────────────────────────────────────
// Gemini brand uses a blue-to-purple gradient, we'll reflect that in accent
const GEMINI_COLOR  = '#4285f4'; // Google Blue
const insightColors = ['var(--easy)', 'var(--medium)', 'var(--accent)'];
const insightIcons  = ['💡', '🎯', '🚀'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GeminiInsight({
  mode      = 'student',   // 'student' | 'teacher'
  stats     = null,
  username  = '',
  classData = [],
  topicData = [],
}) {
  const [insights, setInsights] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(true);

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

    const prompt =
      mode === 'student'
        ? buildStudentPrompt(stats, username)
        : buildTeacherPrompt(classData, topicData);

    try {
      // Calls POST /api/ai/insight through our backend proxy
      // Backend uses Gemini — API key never touches the browser
      const res = await aiAPI.getInsight([{ role: 'user', content: prompt }]);

      // ✅ Gemini returns: { text: '["insight1","insight2","insight3"]' }
      // (responseMimeType: 'application/json' guarantees clean JSON)
      const raw    = res.data.text ?? '[]';
      const clean  = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Gemini returned an unexpected response shape');
      }

      setInsights(parsed);
    } catch (err) {
      console.error('[Gemini insight error]', err);
      setError(err.message || 'Failed to get AI insights');
      toast.error('AI insights failed — check console');
    } finally {
      setLoading(false);
    }
  }, [mode, stats, username, classData, topicData]);

  return (
    <div className="space-y-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Gemini "spark" icon */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: `${GEMINI_COLOR}18`,
              border:     `1px solid ${GEMINI_COLOR}40`,
            }}
          >
            <Sparkles size={12} style={{ color: GEMINI_COLOR }} />
          </div>
          <span
            className="text-xs font-code font-medium"
            style={{ color: GEMINI_COLOR }}
          >
            Gemini AI · {mode === 'student' ? 'Personal' : 'Class'} Insights
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse toggle — only visible once insights are loaded */}
          {insights && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setExpanded((v) => !v)}
              className="p-1 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </motion.button>
          )}

          {/* Main action button */}
          <motion.button
            onClick={fetchInsights}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
            style={{
              background: insights ? 'transparent'   : GEMINI_COLOR,
              color:      insights ? GEMINI_COLOR     : '#ffffff',
              border:     insights ? `1px solid ${GEMINI_COLOR}` : 'none',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
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

      {/* ── Content area ── */}
      <AnimatePresence mode="wait">

        {/* Placeholder — before first fetch */}
        {!insights && !loading && !error && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl text-xs text-center"
            style={{
              background: 'var(--bg-2)',
              border:     '1px dashed var(--border-2)',
              color:      'var(--text-muted)',
            }}
          >
            <Zap
              size={16}
              className="mx-auto mb-2"
              style={{ color: 'var(--text-muted)' }}
            />
            Click{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>
              Get Insights
            </strong>{' '}
            to have Gemini analyze{' '}
            {mode === 'student' ? 'your LeetCode performance' : 'your class data'}{' '}
            and give you 3 actionable coaching tips.
          </motion.div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl skeleton"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
            <p
              className="text-center text-xs font-code pt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Gemini is analyzing your data...
            </p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl text-xs"
            style={{
              background: 'var(--hard-bg)',
              border:     '1px solid var(--hard)',
              color:      'var(--hard)',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {/* Insights */}
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
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
                className="p-3.5 rounded-xl text-xs leading-relaxed"
                style={{
                  background:  'var(--bg-2)',
                  border:      `1px solid ${insightColors[i]}25`,
                  borderLeft:  `3px solid ${insightColors[i]}`,
                  color:       'var(--text-secondary)',
                }}
              >
                <span className="mr-1.5">{insightIcons[i]}</span>
                {insight}
              </motion.div>
            ))}

            {/* Powered-by footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-code text-center pt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Powered by{' '}
              <span style={{ color: GEMINI_COLOR }}>Gemini 2.5 Flash</span>
              {' '}· updates on refresh
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}