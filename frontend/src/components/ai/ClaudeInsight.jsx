import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence }                   from 'framer-motion';
import {
  Brain, RefreshCw, AlertCircle, Zap, TrendingUp,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { aiAPI }      from '@/api';
import useAuthStore   from '@/store/authStore';

// ─── Cache ────────────────────────────────────────────────────────────────────
const CACHE_V   = 'v3';
const CACHE_TTL = 8 * 60 * 60 * 1000; // 8 h
const cKey = (uid, mode) => `dac_ins_${CACHE_V}_${uid}_${mode}`;

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (Date.now() - c.ts > CACHE_TTL) return null;
    return c;
  } catch { return null; }
};
const writeCache = (key, data, sig) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now(), sig }));
  } catch {}
};

// ─── Category config ──────────────────────────────────────────────────────────
const CAT = {
  strength:    { color: 'var(--easy)',    label: 'Strength'          },
  weakness:    { color: 'var(--medium)',  label: 'Focus Area'        },
  interview:   { color: '#818cf8',        label: 'Interview Prep'    },
  daily:       { color: 'var(--accent)',  label: "Today's Task"      },
  pattern:     { color: '#38bdf8',        label: 'Pattern'           },
  motivation:  { color: 'var(--hard)',    label: 'Challenge'         },
  class:       { color: 'var(--accent)',  label: 'Class Health'      },
  action:      { color: 'var(--medium)',  label: 'Action Item'       },
  risk:        { color: 'var(--hard)',    label: 'Risk Alert'        },
  progress:    { color: '#a78bfa',        label: 'Progress'          },
};

// ─── Prompts ──────────────────────────────────────────────────────────────────
const studentPrompt = (stats, username) => {
  const ts   = stats.topicStats instanceof Map
    ? Object.fromEntries(stats.topicStats)
    : stats.topicStats ?? {};
  const sorted   = Object.entries(ts).sort((a, b) => b[1] - a[1]);
  const strong   = sorted.slice(0, 4).map(([t, c]) => `${t}(${c})`).join(', ');
  const weak     = sorted.slice(-4).map(([t, c]) => `${t}(${c})`).join(', ');
  const recent   = (stats.recentSubmissions ?? []).slice(0, 10).map(s => s.title).join(', ');
  const hardPct  = stats.totalSolved > 0 ? ((stats.hardSolved / stats.totalSolved) * 100).toFixed(1) : 0;

  return `You are a world-class DSA coach and tech interview expert. Your job is to help this student land their dream software engineering job at top tech companies.

STUDENT DATA:
Username: @${username ?? 'Unknown'}
Solved: ${stats.totalSolved} total (Easy: ${stats.easySolved}, Medium: ${stats.mediumSolved}, Hard: ${stats.hardSolved})
Hard ratio: ${hardPct}% | Acceptance: ${stats.acceptanceRate}% | Global Rank: #${(stats.ranking ?? 0).toLocaleString()}
Strong topics: ${strong || 'None yet'}
Weak/missing topics: ${weak || 'None yet'}
Total topics covered: ${sorted.length}
Last 10 solves: ${recent || 'None'}

Generate 6-8 highly specific, personalized coaching insights. Each must be directly actionable and placement-focused.

Return a JSON array ONLY. Each object: { "category": one of [strength,weakness,interview,daily,pattern,motivation,progress], "emoji": single emoji, "title": max 6 words, "body": 2-3 sentences with exact numbers from their data, "action": ONE specific task they can do today }

Rules:
- Reference their ACTUAL numbers every time
- weakness: name the exact LeetCode pattern they're missing
- interview: connect their current level to what companies actually ask
- daily: recommend a specific problem or concept to study NOW
- pattern: a DSA pattern they should master next (e.g. "Monotonic Stack", "Segment Tree")
- NO generic advice — make every insight unique to this data
- At least 1 interview, 1 daily, 1 weakness insight

Return ONLY the JSON array. No markdown. No extra text.`;
};

const teacherPrompt = (classData, topicData) => {
  const synced  = classData.filter(d => d.leetcode?.lastSynced);
  const n       = synced.length || 1;
  const avg     = Math.round(synced.reduce((s, d) => s + (d.leetcode?.totalSolved ?? 0), 0) / n);
  const avgAcc  = +(synced.reduce((s, d) => s + (d.leetcode?.acceptanceRate ?? 0), 0) / n).toFixed(1);
  const top3    = [...synced].sort((a, b) => (b.leetcode?.totalSolved ?? 0) - (a.leetcode?.totalSolved ?? 0)).slice(0, 3).map(d => `${d.student.name}(${d.leetcode?.totalSolved ?? 0})`).join(', ');
  const bottom3 = [...synced].sort((a, b) => (a.leetcode?.totalSolved ?? 0) - (b.leetcode?.totalSolved ?? 0)).slice(0, 3).map(d => `${d.student.name}(${d.leetcode?.totalSolved ?? 0})`).join(', ');
  const weakT   = [...topicData].sort((a, b) => a.avg - b.avg).slice(0, 5).map(t => `${t.topic}(avg:${t.avg})`).join(', ');
  const strongT = [...topicData].sort((a, b) => b.avg - a.avg).slice(0, 5).map(t => `${t.topic}(avg:${t.avg})`).join(', ');
  const hardRdy = synced.filter(d => (d.leetcode?.hardSolved ?? 0) >= 10).length;
  const atRisk  = synced.filter(d => (d.leetcode?.mediumSolved ?? 0) < 15).length;
  const unsynced = classData.length - synced.length;

  return `You are an expert CS professor and placement coordinator. Analyze class data and give actionable insights to improve student placement outcomes.

CLASS DATA:
Total: ${classData.length} students | Synced: ${synced.length} | Not synced: ${unsynced}
Class avg solved: ${avg} | Avg acceptance: ${avgAcc}%
Top performers: ${top3 || 'N/A'}
Struggling students: ${bottom3 || 'N/A'}
Placement-ready (10+ Hard): ${hardRdy}/${synced.length}
At-risk students (<15 Medium): ${atRisk} students
Weakest class topics: ${weakT || 'N/A'}
Strongest class topics: ${strongT || 'N/A'}

Generate 6-8 specific, actionable insights for the teacher. Mix of: class health, urgent actions, student spotlights, topic gaps, placement readiness.

Return a JSON array ONLY. Each object: { "category": one of [strength,weakness,action,risk,class,pattern,motivation,progress], "emoji": single emoji, "title": max 6 words, "body": 2-3 sentences with class numbers, "action": one concrete step the teacher should take THIS WEEK }

Rules:
- risk: flag students or topics that are placement risks — name specific students
- action: something assignable or schedulable this week
- Reference actual counts and percentages
- Think about upcoming campus recruitment season

Return ONLY the JSON array. No markdown. No extra text.`;
};

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ insight, index }) {
  const [open, setOpen] = useState(false);
  const cfg = CAT[insight.category] ?? CAT.progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 130 }}
      className="rounded-xl overflow-hidden"
      style={{
        border:     `1px solid ${cfg.color}22`,
        borderLeft: `3px solid ${cfg.color}`,
        background: 'var(--bg-2)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-sm flex-shrink-0 mt-0.5">{insight.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-code px-1.5 py-0.5 rounded-md"
              style={{ background: `${cfg.color}18`, color: cfg.color, fontSize: 9 }}
            >
              {cfg.label}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {insight.title}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {insight.body}
          </p>
        </div>
        <div className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </div>

      {/* Action — expands on click */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <div
                className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}
              >
                <Zap size={10} className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                <span className="text-xs font-medium leading-relaxed" style={{ color: cfg.color }}>
                  {insight.action}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GeminiInsight({ mode, stats, username, classData = [], topicData = [], compact = false }) {
  const { user }       = useAuthStore();
  const [insights,     setInsights]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const prevSigRef = useRef(null);

  const key = cKey(user?._id ?? 'anon', mode);

  // Signature = a hash of the meaningful data so we know when to refetch
  const signature = mode === 'student'
    ? `${stats?.totalSolved}-${stats?.hardSolved}-${Object.keys(stats?.topicStats ?? {}).length}`
    : `${classData.length}-${classData.filter(d => d.leetcode?.lastSynced).length}`;

  const isReady = mode === 'student'
    ? !!(stats && stats.totalSolved !== undefined)
    : classData.length > 0;

  const doFetch = useCallback(async (force = false) => {
    if (!isReady) return;

    if (!force) {
      const cached = readCache(key);
      if (cached && cached.sig === signature) {
        setInsights(cached.data);
        setLastUpdated(new Date(cached.ts));
        prevSigRef.current = signature;
        return;
      }
    }

    setLoading(true);
    setError(null);

    const prompt = mode === 'student'
      ? studentPrompt(stats, username)
      : teacherPrompt(classData, topicData);

    try {
      const res    = await aiAPI.getInsight([{ role: 'user', content: prompt }]);
      const raw    = res.data.text ?? '[]';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Bad shape');
      setInsights(parsed);
      setLastUpdated(new Date());
      writeCache(key, parsed, signature);
      prevSigRef.current = signature;
    } catch {
      setError('Could not load insights');
      const stale = readCache(key);
      if (stale) { setInsights(stale.data); setLastUpdated(new Date(stale.ts)); }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isReady, signature, mode, stats, username, classData, topicData, key]);

  // Auto-fetch when data becomes ready or signature changes
  useEffect(() => {
    if (!isReady) return;
    if (signature !== prevSigRef.current) {
      doFetch(false);
    }
  }, [signature, isReady]);

  // Refresh after LC sync
  useEffect(() => {
    const handler = () => { setRefreshing(true); doFetch(true); };
    window.addEventListener('leetcode-synced', handler);
    return () => window.removeEventListener('leetcode-synced', handler);
  }, [doFetch]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <Brain size={12} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI Insights
          </span>
          {lastUpdated && !loading && (
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {isReady && (
          <motion.button
            onClick={() => { setRefreshing(true); doFetch(true); }}
            disabled={loading || refreshing}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg disabled:opacity-40"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-2)' }}
            title="Refresh insights"
          >
            <motion.div
              animate={{ rotate: (loading || refreshing) ? 360 : 0 }}
              transition={{ duration: 1, repeat: (loading || refreshing) ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw size={12} />
            </motion.div>
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Not ready */}
        {!isReady && (
          <motion.div key="nr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="py-8 text-center rounded-xl"
                      style={{ background: 'var(--bg-2)', border: '1px dashed var(--border-2)' }}>
            <TrendingUp size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              {mode === 'student'
                ? 'Sync LeetCode to unlock personalized coaching'
                : 'Add students to unlock class insights'}
            </p>
          </motion.div>
        )}

        {/* Loading skeletons */}
        {isReady && loading && !insights && (
          <motion.div key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-[72px] rounded-xl skeleton"
                   style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
            <p className="text-center text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              Analyzing your data...
            </p>
          </motion.div>
        )}

        {/* Error */}
{error && !loading && !insights && (
  <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 rounded-xl text-xs space-y-2"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
    <div className="flex items-center gap-2" style={{ color: 'var(--medium)' }}>
      <AlertCircle size={12} />
      <span className="font-semibold">AI service is busy</span>
    </div>
    <p style={{ color: 'var(--text-muted)' }}>
      High demand on the AI servers. Your cached insights are shown below — click refresh to retry.
    </p>
    <motion.button
      onClick={() => { setRefreshing(true); doFetch(true); }}
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
    >
      <RefreshCw size={10} /> Retry Now
    </motion.button>
  </motion.div>
)}

        {/* Insights */}
{insights && !loading && (
  <motion.div key="ins" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-2">
    {(compact
      // In compact mode: prioritise daily > weakness > interview, max 3
      ? [...insights]
          .sort((a, b) => {
            const order = { daily: 0, weakness: 1, interview: 2, pattern: 3, strength: 4, motivation: 5, progress: 6 };
            return (order[a.category] ?? 9) - (order[b.category] ?? 9);
          })
          .slice(0, 3)
      : insights
    ).map((ins, i) => (
      <InsightCard key={i} insight={ins} index={i} />
    ))}
    {!compact && (
      <p className="text-xs font-code text-center pt-1" style={{ color: 'var(--text-muted)' }}>
        {insights.length} insights · tap any card to see action →
      </p>
    )}
  </motion.div>
)}
      </AnimatePresence>
    </div>
  );
}