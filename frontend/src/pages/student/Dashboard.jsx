import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flame, Trophy, TrendingUp, ExternalLink, Brain, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { leetcodeAPI, authAPI } from '@/api';
import useAuthStore from '@/store/authStore';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import DifficultyBadge from '@/components/shared/DifficultyBadge';
import { StatSkeleton, CardSkeleton } from '@/components/shared/LoadingPulse';
import SolvedRadial from '@/components/charts/SolvedRadar';
import TopicBreakdown from '@/components/charts/TopicBreakdown';
import StreakCalendar from '@/components/charts/StreakCalendar';
import GeminiInsight from '@/components/ai/ClaudeInsight';
import { formatNumber, relativeTime } from '@/lib/utils';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
      whileHover={{ y: -3, boxShadow: `0 8px 32px ${color}20` }}
      className="card p-5 cursor-default"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-code font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="font-display font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
        <AnimatedCounter value={value} duration={1000} />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, extra, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 70 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {extra}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Onboarding prompt ────────────────────────────────────────────────────────
function SetupPrompt({ user, onSave }) {
  const [username, setUsername] = useState(user?.leetcodeUsername || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
   const res = await onSave({ leetcodeUsername: username });
    setSaving(false);
    if (res.success) toast.success('Profile updated! Now sync your LeetCode 🎉');
    else toast.error(res.error || 'Update failed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 mb-6"
      style={{ border: '1px solid rgba(74,222,128,0.3)', background: 'var(--accent-glow)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
             style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}>
          <AlertCircle size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            Set up your profile first
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Enter your LeetCode username and class code to start syncing your progress.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'LeetCode Username', val: username, set: setUsername, placeholder: 'e.g. john_doe_lc' },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                <input
                  value={val} onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none font-code"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || !username}
            className="mt-4 px-5 py-2 rounded-xl text-xs font-display font-bold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0a0f' }}
          >
            {saving ? 'Saving...' : 'Save & Continue →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, updateProfile } = useAuthStore();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leetcodeAPI.getStats();
      setStats(res.data.leetcode);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen to navbar sync events
    const onSync = (e) => setStats(e.detail);
    window.addEventListener('leetcode-synced', onSync);
    return () => window.removeEventListener('leetcode-synced', onSync);
  }, [fetchStats]);

  const handleManualSync = async () => {
    if (!user?.leetcodeUsername) { toast.error('Set your LeetCode username first'); return; }
    setSyncing(true);
    try {
      const res = await leetcodeAPI.sync();
      setStats(res.data.leetcode);
      toast.success('Synced! ✅');
    } catch (err) {
      toast.error(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const needsSetup = !user?.leetcodeUsername;
  const lc = stats;

  const topicStatsObj = lc?.topicStats instanceof Map
    ? Object.fromEntries(lc.topicStats)
    : lc?.topicStats || {};

  // Acceptance rate display
  const acceptance = lc ? `${lc.acceptanceRate}% acceptance` : 'Not synced';

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Setup prompt */}
      <AnimatePresence>
        {needsSetup && <SetupPrompt user={user} onSave={updateProfile} />}
      </AnimatePresence>

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {lc
              ? `Last synced ${relativeTime(new Date(lc.lastSynced).getTime())} · Rank #${formatNumber(lc.ranking)}`
              : 'Sync your LeetCode to see your stats'}
          </p>
        </div>

        {!needsSetup && (
          <motion.button
            onClick={handleManualSync}
            disabled={syncing}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto"
            style={{
              background: 'var(--accent-glow)',
              border:     '1px solid var(--accent)',
              color:      'var(--accent)',
            }}
          >
            <motion.div animate={{ rotate: syncing ? 360 : 0 }}
                        transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={14} />
            </motion.div>
            {syncing ? 'Syncing...' : 'Sync LeetCode'}
          </motion.button>
        )}
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Solved" value={lc?.totalSolved ?? 0}
              sub={acceptance} icon={Target}
              color="var(--accent)" delay={0}
            />
            <StatCard
              label="Easy" value={lc?.easySolved ?? 0}
              sub="problems solved" icon={TrendingUp}
              color="var(--easy)" delay={0.07}
            />
            <StatCard
              label="Medium" value={lc?.mediumSolved ?? 0}
              sub="problems solved" icon={Flame}
              color="var(--medium)" delay={0.14}
            />
            <StatCard
              label="Hard" value={lc?.hardSolved ?? 0}
              sub="problems solved" icon={Trophy}
              color="var(--hard)" delay={0.21}
            />
          </>
        )}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Radial chart */}
        <Section title="Difficulty Split" delay={0.25}>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : lc ? (
            <SolvedRadial
              easy={lc.easySolved}
              medium={lc.mediumSolved}
              hard={lc.hardSolved}
            />
          ) : (
            <EmptyState msg="Sync to see difficulty breakdown" />
          )}
        </Section>

        {/* Topic breakdown — spans 2 cols */}
        <div className="lg:col-span-2">
          <Section title="Topic Breakdown" delay={0.3}
            extra={
              <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                All topics
              </span>
            }
          >
            {loading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <TopicBreakdown topicStats={topicStatsObj} />
            )}
          </Section>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Streak calendar — 3 cols */}
        <div className="lg:col-span-3">
          <Section title="Activity Heatmap" delay={0.35}>
            {loading ? (
              <CardSkeleton lines={4} />
            ) : (
              <StreakCalendar recentSubmissions={lc?.recentSubmissions ?? []} />
            )}
          </Section>
        </div>

        {/* AI insight panel — 2 cols */}
        <div className="lg:col-span-2">
<Section
  title="AI Insight"
  delay={0.4}
  extra={
    lc && (
      <Link
        to="/student/progress"
        className="text-xs font-code flex items-center gap-1"
        style={{ color: 'var(--accent)' }}
      >
        See all →
      </Link>
    )
  }
>
  <GeminiInsight
    mode="student"
    stats={lc}
    username={user?.leetcodeUsername ?? ''}
    compact={true}
  />
</Section>
        </div>
      </div>

      {/* Recent submissions */}
      <Section
        title="Recent Accepted Submissions"
        delay={0.45}
        extra={
          lc?.recentSubmissions?.length ? (
            <a href={`https://leetcode.com/${user?.leetcodeUsername}`}
               target="_blank" rel="noreferrer"
               className="flex items-center gap-1 text-xs font-code"
               style={{ color: 'var(--text-muted)' }}>
              View all <ExternalLink size={10} />
            </a>
          ) : null
        }
      >
        {loading ? (
          <CardSkeleton lines={5} />
        ) : !lc?.recentSubmissions?.length ? (
          <EmptyState msg="No recent submissions — sync LeetCode first" />
        ) : (
          <div className="space-y-2">
            {lc.recentSubmissions.slice(0, 8).map((sub, i) => (
              <motion.a
                key={sub.titleSlug + i}
                href={`https://leetcode.com/problems/${sub.titleSlug}`}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl group cursor-pointer"
                style={{ background: 'var(--bg-2)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--easy)' }} />
                  <span className="text-sm font-medium truncate group-hover:underline"
                        style={{ color: 'var(--text-primary)', textDecorationColor: 'var(--accent)' }}>
                    {sub.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-xs px-1.5 py-0.5 rounded font-code"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}>
                    {sub.lang?.slice(0, 4)}
                  </span>
                  <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                    {relativeTime(sub.timestamp)}
                  </span>
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--text-muted)' }} />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ msg }) {
  return (
    <div className="flex items-center justify-center h-32">
      <p className="text-sm font-code text-center" style={{ color: 'var(--text-muted)' }}>{msg}</p>
    </div>
  );
}









