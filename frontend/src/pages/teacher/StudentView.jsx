import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useLeetcodeStats } from '@/hooks/useLeetcode';
import SolvedRadial from '@/components/charts/SolvedRadar';
import TopicBreakdown from '@/components/charts/TopicBreakdown';
import ProgressLine from '@/components/charts/ProgressLine';
import StreakCalendar from '@/components/charts/StreakCalendar';
import GeminiInsight from '@/components/ai/ClaudeInsight';
import { StatSkeleton, CardSkeleton } from '@/components/shared/LoadingPulse';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { relativeTime, formatNumber } from '@/lib/utils';

function Card({ title, extra, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
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

export default function StudentView() {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const { stats: lc, loading } = useLeetcodeStats(studentId);

  const topicStatsObj = lc?.topicStats instanceof Map
    ? Object.fromEntries(lc.topicStats)
    : lc?.topicStats ?? {};

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Back btn */}
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate('/teacher')}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={15} /> Back to Overview
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            Student Profile
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {lc?.lastSynced
              ? <><Wifi size={11} style={{ color: 'var(--easy)' }} />
                  <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                    Last synced {relativeTime(new Date(lc.lastSynced).getTime())}
                  </span></>
              : <><WifiOff size={11} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Never synced</span></>
            }
          </div>
        </div>
      </motion.div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
          [
            { label: 'Total Solved',  value: lc?.totalSolved ?? 0,   color: 'var(--accent)',  sub: `Rank #${formatNumber(lc?.ranking ?? 0)}` },
            { label: 'Easy',          value: lc?.easySolved ?? 0,    color: 'var(--easy)',    sub: 'problems'         },
            { label: 'Medium',        value: lc?.mediumSolved ?? 0,  color: 'var(--medium)',  sub: 'problems'         },
            { label: 'Hard',          value: lc?.hardSolved ?? 0,    color: 'var(--hard)',    sub: `${lc?.acceptanceRate ?? 0}% acceptance` },
          ].map(({ label, value, color, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-4"
            >
              <p className="text-xs font-code mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="font-display font-black text-2xl" style={{ color }}>
                <AnimatedCounter value={value} />
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Submission trend + radial */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Submission Trend" delay={0.25}>
            {loading ? <div className="h-44 skeleton rounded-xl" /> : <ProgressLine recentSubmissions={lc?.recentSubmissions ?? []} />}
          </Card>
        </div>
        <Card title="Difficulty Split" delay={0.3}>
          {loading ? <div className="h-44 skeleton rounded-xl" /> : (
            <SolvedRadial easy={lc?.easySolved} medium={lc?.mediumSolved} hard={lc?.hardSolved} />
          )}
        </Card>
      </div>

      {/* Topic + Calendar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Topic Breakdown" delay={0.35}>
          {loading ? <CardSkeleton /> : <TopicBreakdown topicStats={topicStatsObj} />}
        </Card>
        <Card title="Activity Heatmap" delay={0.38}>
          {loading ? <CardSkeleton /> : <StreakCalendar recentSubmissions={lc?.recentSubmissions ?? []} />}
        </Card>
      </div>

      {/* Claude insight for this student */}
      <Card title="" delay={0.42}>
        {lc ? (
          <GeminiInsight
            mode="student"
            stats={lc}
            username={lc?.username ?? ''}
          />
        ) : (
          <p className="text-sm font-code text-center py-6" style={{ color: 'var(--text-muted)' }}>
            Student hasn't synced LeetCode yet
          </p>
        )}
      </Card>

      {/* Recent submissions */}
      {!loading && lc?.recentSubmissions?.length > 0 && (
        <Card title="Recent Accepted Submissions" delay={0.46}>
          <div className="space-y-2">
            {lc.recentSubmissions.slice(0, 10).map((sub, i) => (
              <motion.a
                key={sub.titleSlug + i}
                href={`https://leetcode.com/problems/${sub.titleSlug}`}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.46 + i * 0.04 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl group"
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
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-60" style={{ color: 'var(--text-muted)' }} />
                </div>
              </motion.a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}