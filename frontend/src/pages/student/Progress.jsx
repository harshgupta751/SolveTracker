import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TrendingUp, Award, Target, Zap, ExternalLink } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useLeetcodeStats } from '@/hooks/useLeetcode';
import { useSheets } from '@/hooks/useSheets';
import SolvedRadial from '@/components/charts/SolvedRadar';
import TopicBreakdown from '@/components/charts/TopicBreakdown';
import ProgressLine from '@/components/charts/ProgressLine';
import StreakCalendar from '@/components/charts/StreakCalendar';
import GeminiInsight from '@/components/ai/ClaudeInsight';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { StatSkeleton, CardSkeleton } from '@/components/shared/LoadingPulse';
import useAuthStore from '@/store/authStore';
import { relativeTime, formatNumber } from '@/lib/utils';

// ─── Radar tooltip ────────────────────────────────────────────────────────────
const RadarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs font-code"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <strong>{payload[0].payload.topic}</strong>: {payload[0].value} solved
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, extra, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 75 }}
      className={`card p-5 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {extra}
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ solved }) {
  const tiers = [
    { min: 0,   max: 49,  label: 'Rookie',     color: '#94a3b8', emoji: '🌱' },
    { min: 50,  max: 149, label: 'Grinder',    color: 'var(--easy)',   emoji: '⚡' },
    { min: 150, max: 299, label: 'Coder',      color: 'var(--medium)', emoji: '🔥' },
    { min: 300, max: 499, label: 'Expert',     color: '#818cf8',       emoji: '💎' },
    { min: 500, max: Infinity, label: 'Legend', color: 'var(--hard)',   emoji: '👑' },
  ];
  const tier = tiers.find(t => solved >= t.min && solved <= t.max) ?? tiers[0];
  const next = tiers[tiers.indexOf(tier) + 1];
  const pct  = next ? Math.min(100, Math.round(((solved - tier.min) / (next.min - tier.min)) * 100)) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 80 }}
      className="p-5 rounded-xl space-y-3"
      style={{ background: `${tier.color}12`, border: `1px solid ${tier.color}30` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-code mb-0.5" style={{ color: 'var(--text-muted)' }}>Current Tier</p>
          <p className="font-display font-black text-2xl" style={{ color: tier.color }}>
            {tier.emoji} {tier.label}
          </p>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Next tier</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{next.label}</p>
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              {next.min - solved} more
            </p>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          <span>{tier.label}</span>
          {next && <span>{next.label}</span>}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: tier.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Progress() {
  const { user } = useAuthStore();
  const { stats: lc, loading } = useLeetcodeStats();
  const { sheets } = useSheets();

  const topicStatsObj = useMemo(() =>
    lc?.topicStats instanceof Map
      ? Object.fromEntries(lc.topicStats)
      : lc?.topicStats ?? {},
    [lc]
  );

  // Build radar data from top 6 topics
  const radarData = useMemo(() =>
    Object.entries(topicStatsObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, count]) => ({
        topic: topic.length > 10 ? topic.slice(0, 10) + '…' : topic,
        count,
        fullMark: Math.max(...Object.values(topicStatsObj)) || 1,
      })),
    [topicStatsObj]
  );

  // Sheet completion stats
  const sheetStats = useMemo(() => {
    const totalSheets    = sheets.length;
    const totalProblems  = sheets.reduce((s, sh) => s + sh.problems.length, 0);
    return { totalSheets, totalProblems };
  }, [sheets]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1200px]">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5"><CardSkeleton lines={6} /></div>
          <div className="card p-5"><CardSkeleton lines={6} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            My Progress
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            A full picture of your DSA journey
            {lc?.lastSynced && (
              <> · Last synced {relativeTime(new Date(lc.lastSynced).getTime())}</>
            )}
          </p>
        </div>
        {lc?.ranking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-right"
          >
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Global Rank</p>
            <p className="font-display font-black text-2xl" style={{ color: 'var(--accent)' }}>
              #{formatNumber(lc.ranking)}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Solved',   value: lc?.totalSolved ?? 0,       color: 'var(--accent)',  icon: Target,   sub: `${lc?.acceptanceRate ?? 0}% acceptance` },
          { label: 'Easy',           value: lc?.easySolved ?? 0,         color: 'var(--easy)',    icon: TrendingUp, sub: 'problems'         },
          { label: 'Medium',         value: lc?.mediumSolved ?? 0,       color: 'var(--medium)',  icon: Zap,       sub: 'problems'         },
          { label: 'Hard',           value: lc?.hardSolved ?? 0,         color: 'var(--hard)',    icon: Award,     sub: 'problems'         },
        ].map(({ label, value, color, icon: Icon, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 80 }}
            whileHover={{ y: -3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="font-display font-black text-3xl mb-1" style={{ color }}>
              <AnimatedCounter value={value} />
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Rank badge + Radial */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <RankBadge solved={lc?.totalSolved ?? 0} />

          {/* Sheet stats */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Sheets Progress
            </h3>
            <div className="flex justify-around">
              {[
                { val: sheetStats.totalSheets,   label: 'Sheets'   },
                { val: sheetStats.totalProblems, label: 'Problems' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display font-black text-2xl" style={{ color: 'var(--accent)' }}>{val}</p>
                  <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card title="Difficulty Distribution" delay={0.2}>
            <SolvedRadial
              easy={lc?.easySolved}
              medium={lc?.mediumSolved}
              hard={lc?.hardSolved}
            />
          </Card>
        </div>
      </div>

      {/* Submission trend + Radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Submission Activity" delay={0.28}>
          <ProgressLine recentSubmissions={lc?.recentSubmissions ?? []} />
        </Card>

        <Card title="Skill Radar" delay={0.32}>
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
                />
                <PolarRadiusAxis
                  angle={30} domain={[0, 'auto']}
                  tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                />
                <Radar
                  name="Solved" dataKey="count"
                  stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                />
                <Tooltip content={<RadarTip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-sm font-code"
                 style={{ color: 'var(--text-muted)' }}>
              Solve 3+ topics to unlock radar chart
            </div>
          )}
        </Card>
      </div>

      {/* Topic bar + Heatmap */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Topic Breakdown" delay={0.35}>
          <TopicBreakdown topicStats={topicStatsObj} />
        </Card>
        <Card title="Activity Heatmap" delay={0.38}>
          <StreakCalendar recentSubmissions={lc?.recentSubmissions ?? []} />
        </Card>
      </div>

      {/* Claude personal insight */}
      <Card title="" delay={0.42}>
        <GeminiInsight
          mode="student"
          stats={lc}
          username={user?.leetcodeUsername ?? ''}
        />
      </Card>

      {/* Recent AC submissions table */}
      {lc?.recentSubmissions?.length > 0 && (
        <Card title="Recent Accepted" delay={0.46}>
          <div className="space-y-1.5">
            {lc.recentSubmissions.map((sub, i) => (
              <motion.a
                key={sub.titleSlug + i}
                href={`https://leetcode.com/problems/${sub.titleSlug}`}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.46 + i * 0.04 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl group"
                style={{ background: 'var(--bg-2)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--easy)' }} />
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{sub.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs px-1.5 py-0.5 rounded font-code"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 10 }}>
                    {sub.lang?.slice(0, 4)}
                  </span>
                  <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                    {relativeTime(sub.timestamp)}
                  </span>
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity"
                                style={{ color: 'var(--text-muted)' }} />
                </div>
              </motion.a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}