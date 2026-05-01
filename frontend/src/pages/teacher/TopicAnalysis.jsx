import { useState, useCallback, useMemo }    from 'react';
import { motion, AnimatePresence }            from 'framer-motion';
import { useNavigate }                        from 'react-router-dom';
import {
  ArrowLeft, Search, ChevronDown, Trophy, TrendingUp,
  Sprout, Wifi, WifiOff, BarChart3, Users, Target,
  ExternalLink, Zap,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import toast               from 'react-hot-toast';
import { analyticsAPI }    from '@/api';
import { useClassAnalytics } from '@/hooks/useAnalytics';
import { CardSkeleton }    from '@/components/shared/LoadingPulse';
import { relativeTime }    from '@/lib/utils';

// ─── Category config ──────────────────────────────────────────────────────────
const CATS = {
  gallant: {
    label:   'Gallant',
    emoji:   '🏆',
    desc:    'Well above class average — strong grasp of this topic',
    color:   'var(--easy)',
    bg:      'var(--easy-bg)',
    border:  'rgba(74,222,128,0.30)',
    glow:    'rgba(74,222,128,0.10)',
  },
  average: {
    label:   'Average',
    emoji:   '📈',
    desc:    'Around class average — building solid foundations',
    color:   'var(--medium)',
    bg:      'var(--medium-bg)',
    border:  'rgba(251,191,36,0.30)',
    glow:    'rgba(251,191,36,0.08)',
  },
  gradual: {
    label:   'Gradual',
    emoji:   '🌱',
    desc:    'Below average — needs focus and targeted practice',
    color:   'var(--hard)',
    bg:      'var(--hard-bg)',
    border:  'rgba(239,68,68,0.28)',
    glow:    'rgba(239,68,68,0.06)',
  },
  unsynced: {
    label:   'Not Synced',
    emoji:   '⚡',
    desc:    'No LeetCode data — ask student to sync',
    color:   'var(--text-muted)',
    bg:      'var(--border)',
    border:  'var(--border)',
    glow:    'transparent',
  },
};

// ─── Student card ─────────────────────────────────────────────────────────────
function StudentCard({ row, rank, cat, index }) {
  const cfg = CATS[cat];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 120 }}
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        background: cfg.glow,
        border:     `1px solid ${cfg.border}`,
      }}
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0">
        {rank <= 3 && cat === 'gallant'
          ? <span className="text-base">{['🥇','🥈','🥉'][rank - 1]}</span>
          : <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>#{rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {row.student.avatar ? (
          <img src={row.student.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
               style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {row.student.name?.[0]?.toUpperCase()}
          </div>
        )}
        {/* Sync indicator */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background:  row.lastSynced ? 'var(--easy)' : 'var(--text-muted)',
            borderColor: 'var(--surface)',
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {row.student.name}
        </p>
        <p className="text-xs font-code truncate" style={{ color: 'var(--text-muted)' }}>
          {row.student.leetcodeUsername ? `@${row.student.leetcodeUsername}` : row.student.email}
        </p>
      </div>

      {/* Topic count */}
      <div className="text-right flex-shrink-0">
        <p className="font-display font-black text-lg leading-none" style={{ color: cfg.color }}>
          {row.topicCount}
        </p>
        <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>solved</p>
      </div>

      {/* Total solved */}
      <div className="text-right flex-shrink-0 w-14 hidden sm:block">
        <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          {row.totalSolved}
        </p>
        <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>total</p>
      </div>
    </motion.div>
  );
}

// ─── Category column ──────────────────────────────────────────────────────────
function CategoryColumn({ cat, students, classAvg }) {
  const cfg = CATS[cat];
  if (!students.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${cfg.border}`, background: 'var(--surface)' }}
    >
      {/* Column header */}
      <div className="px-4 py-3 flex items-center justify-between"
           style={{ background: cfg.glow, borderBottom: `1px solid ${cfg.border}` }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.emoji}</span>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: cfg.color }}>
              {cfg.label}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {cfg.desc}
            </p>
          </div>
        </div>
        <span
          className="font-display font-black text-xl px-2.5 py-1 rounded-xl"
          style={{ background: `${cfg.color}18`, color: cfg.color }}
        >
          {students.length}
        </span>
      </div>

      {/* Students */}
      <div className="p-3 space-y-2">
        {students.map((row, i) => (
          <StudentCard
            key={row.student._id}
            row={row}
            rank={i + 1}
            cat={cat}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Distribution bar chart ───────────────────────────────────────────────────
function DistributionChart({ data }) {
  const chartData = [
    { name: '0',    count: data.filter(r => r.topicCount === 0 && r.lastSynced).length, color: 'var(--border-2)' },
    { name: '1–5',  count: data.filter(r => r.topicCount >= 1 && r.topicCount <= 5).length, color: 'var(--medium)' },
    { name: '6–15', count: data.filter(r => r.topicCount >= 6 && r.topicCount <= 15).length, color: 'var(--easy)' },
    { name: '16–30',count: data.filter(r => r.topicCount >= 16 && r.topicCount <= 30).length, color: '#818cf8' },
    { name: '31+',  count: data.filter(r => r.topicCount >= 31).length, color: '#f59e0b' },
  ].filter(d => d.count > 0);

  if (!chartData.length) return null;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} allowDecimals={false} />
        <ReTooltip
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)',
                         borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
          labelStyle={{ color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--accent)' }}
          cursor={{ fill: 'rgba(74,222,128,0.05)' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main TopicAnalysis page ──────────────────────────────────────────────────
export default function TopicAnalysis() {
  const navigate                    = useNavigate();
  const { topicData, classData, loading: analyticsLoading } = useClassAnalytics();

  const [selectedTopic, setSelectedTopic] = useState('');
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [search,        setSearch]        = useState('');
  const [showTopicMenu, setShowTopicMenu] = useState(false);

  // All available topics from class data
  const allTopics = useMemo(() =>
    [...topicData].sort((a, b) => b.total - a.total).map(t => t.topic),
    [topicData]
  );

  const filteredTopics = useMemo(() =>
    allTopics.filter(t => t.toLowerCase().includes(search.toLowerCase())),
    [allTopics, search]
  );

  const handleAnalyse = useCallback(async (topic) => {
    if (!topic) { toast.error('Select a topic first'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyticsAPI.getTopicStudents(topic);
      setResult(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load topic analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTopic = (topic) => {
    setSelectedTopic(topic);
    setShowTopicMenu(false);
    setSearch('');
    handleAnalyse(topic);
  };

  // Split into categories
  const gallant  = result?.categorised?.filter(r => r.category === 'gallant')  ?? [];
  const average  = result?.categorised?.filter(r => r.category === 'average')  ?? [];
  const gradual  = result?.categorised?.filter(r => r.category === 'gradual')  ?? [];
  const unsynced = result?.categorised?.filter(r => r.category === 'unsynced') ?? [];

  // Action recommendations
  const recommendations = useMemo(() => {
    if (!result) return [];
    const recs = [];
    if (gradual.length > 0) {
      recs.push({
        icon: '📋',
        text: `Assign a dedicated ${selectedTopic} sheet — ${gradual.length} student${gradual.length > 1 ? 's' : ''} need structured practice`,
        action: 'Create Sheet',
        onClick: () => navigate('/teacher/create-sheet'),
        color: 'var(--hard)',
      });
    }
    if (gallant.length > 0 && gallant.length < (result.total * 0.3)) {
      recs.push({
        icon: '🚀',
        text: `Challenge your top ${gallant.length} Gallant student${gallant.length > 1 ? 's' : ''} with Hard-level ${selectedTopic} problems`,
        color: 'var(--easy)',
      });
    }
    if (unsynced.length > 0) {
      recs.push({
        icon: '⚡',
        text: `${unsynced.length} student${unsynced.length > 1 ? 's' : ''} haven't synced LeetCode yet — no data available for them`,
        color: 'var(--medium)',
      });
    }
    if (result.classAvg < 5) {
      recs.push({
        icon: '📚',
        text: `Class avg is only ${result.classAvg} problems on ${selectedTopic} — consider dedicating next lecture to this topic`,
        color: '#818cf8',
      });
    }
    return recs;
  }, [result, gradual, gallant, unsynced, selectedTopic, navigate]);

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4">
        <motion.button whileHover={{ x: -4 }} onClick={() => navigate('/teacher')}
                       className="flex items-center gap-2 text-sm"
                       style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> Back
        </motion.button>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            Topic Analysis
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Select a topic to see how each student performs — categorised and actionable
          </p>
        </div>
      </motion.div>

      {/* Topic selector */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }} className="card p-5">
        <p className="font-display font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Choose a Topic
        </p>

        <div className="flex flex-wrap gap-2">
          {analyticsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-xl skeleton" />
            ))
          ) : allTopics.length === 0 ? (
            <p className="text-sm font-code" style={{ color: 'var(--text-muted)' }}>
              No topics yet — students must sync LeetCode first.
            </p>
          ) : (
            allTopics.map(topic => {
              const td = topicData.find(t => t.topic === topic);
              return (
                <motion.button
                  key={topic}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectTopic(topic)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: selectedTopic === topic
                      ? 'var(--accent-glow)' : 'var(--bg-2)',
                    border: selectedTopic === topic
                      ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: selectedTopic === topic
                      ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow: selectedTopic === topic
                      ? '0 0 12px rgba(74,222,128,0.12)' : 'none',
                  }}
                >
                  {topic}
                  {td && (
                    <span className="font-code opacity-60" style={{ fontSize: 10 }}>
                      {td.avg}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-5"><CardSkeleton lines={5} /></div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !result && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <Target size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="font-display font-black text-xl mb-2"
                style={{ color: 'var(--text-primary)' }}>
              Select a topic above
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pick any topic to instantly see your class broken into Gallant, Average, and Gradual tiers
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!loading && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }} className="space-y-5">

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Class Avg',  value: result.classAvg,   unit: 'problems', color: 'var(--accent)',  emoji: '📊' },
                { label: 'Gallant',    value: gallant.length,     unit: 'students', color: 'var(--easy)',    emoji: '🏆' },
                { label: 'Average',    value: average.length,     unit: 'students', color: 'var(--medium)',  emoji: '📈' },
                { label: 'Gradual',    value: gradual.length,     unit: 'students', color: 'var(--hard)',    emoji: '🌱' },
              ].map(({ label, value, unit, color, emoji }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{emoji}</span>
                    <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <p className="font-display font-black text-2xl" style={{ color }}>
                    {value}
                  </p>
                  <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{unit}</p>
                </motion.div>
              ))}
            </div>

            {/* Distribution chart + Recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Distribution */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }} className="card p-5">
                <p className="font-display font-bold text-sm mb-3"
                   style={{ color: 'var(--text-primary)' }}>
                  Solve Distribution — {selectedTopic}
                </p>
                <DistributionChart data={result.categorised} />
              </motion.div>

              {/* Action recommendations */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }} className="card p-5">
                <p className="font-display font-bold text-sm mb-3"
                   style={{ color: 'var(--text-primary)' }}>
                  💡 Action Recommendations
                </p>
                {recommendations.length === 0 ? (
                  <p className="text-sm font-code" style={{ color: 'var(--text-muted)' }}>
                    Class looks balanced on this topic! Keep going.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.08 }}
                                  className="flex items-start gap-2.5 p-3 rounded-xl"
                                  style={{ background: 'var(--bg-2)', border: `1px solid ${rec.color}20` }}>
                        <span className="text-base flex-shrink-0 mt-0.5">{rec.icon}</span>
                        <p className="text-xs leading-relaxed flex-1"
                           style={{ color: 'var(--text-secondary)' }}>
                          {rec.text}
                        </p>
                        {rec.action && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                         onClick={rec.onClick}
                                         className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                                         style={{ background: `${rec.color}15`,
                                                  border: `1px solid ${rec.color}30`,
                                                  color: rec.color }}>
                            {rec.action}
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* 3-column categorised view */}
            <div className="grid md:grid-cols-3 gap-4">
              <CategoryColumn cat="gallant" students={gallant} classAvg={result.classAvg} />
              <CategoryColumn cat="average" students={average} classAvg={result.classAvg} />
              <CategoryColumn cat="gradual" students={gradual} classAvg={result.classAvg} />
            </div>

            {/* Unsynced */}
            {unsynced.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }} className="card p-5">
                <p className="font-display font-bold text-sm mb-3 flex items-center gap-2"
                   style={{ color: 'var(--text-muted)' }}>
                  <WifiOff size={13} /> Not Synced ({unsynced.length})
                  <span className="text-xs font-code font-normal">
                    — no LeetCode data available
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {unsynced.map(({ student }) => (
                    <div key={student._id}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                         style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                        {student.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                        {student.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}