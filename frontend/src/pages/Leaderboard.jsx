import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Flame, Target, TrendingUp,
  ArrowUp, ArrowDown, Minus, Search, Wifi, WifiOff,
} from 'lucide-react';
import { useLeaderboard } from '@/hooks/useAnalytics';
import useAuthStore from '@/store/authStore';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import DifficultyDonut from '@/components/charts/DifficultyDonut';
import { CardSkeleton } from '@/components/shared/LoadingPulse';
import { formatNumber, relativeTime } from '@/lib/utils';

// ─── Tier config ──────────────────────────────────────────────────────────────
const getTier = (solved) => {
  if (solved >= 500) return { label: 'Legend',  color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  emoji: '👑' };
  if (solved >= 300) return { label: 'Expert',  color: '#818cf8', glow: 'rgba(129,140,248,0.3)', emoji: '💎' };
  if (solved >= 150) return { label: 'Coder',   color: 'var(--medium)', glow: 'rgba(251,191,36,0.25)', emoji: '🔥' };
  if (solved >= 50)  return { label: 'Grinder', color: 'var(--easy)',   glow: 'rgba(74,222,128,0.2)',  emoji: '⚡' };
  return                     { label: 'Rookie', color: 'var(--text-muted)', glow: 'transparent',   emoji: '🌱' };
};

const rankColors = {
  1: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', text: '#f59e0b', medal: '🥇' },
  2: { bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)', text: '#94a3b8', medal: '🥈' },
  3: { bg: 'rgba(180,83,9,0.10)',  border: 'rgba(180,83,9,0.28)',   text: '#b45309', medal: '🥉' },
};

// ─── Top 3 podium ─────────────────────────────────────────────────────────────
function Podium({ students }) {
  const [first, second, third] = students;

  const PodiumCard = ({ student, lc, rank, heightClass, delay }) => {
    if (!student) return <div className={heightClass} />;
    const tier = getTier(lc?.totalSolved ?? 0);
    const rc   = rankColors[rank];

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 70 }}
        className="flex flex-col items-center gap-3"
      >
        {/* Avatar */}
        <div className="relative">
          {student.avatar ? (
            <img src={student.avatar} alt=""
                 className="rounded-full object-cover"
                 style={{ width: rank === 1 ? 72 : 56, height: rank === 1 ? 72 : 56 }} />
          ) : (
            <div className="rounded-full flex items-center justify-center font-display font-black"
                 style={{
                   width:      rank === 1 ? 72 : 56,
                   height:     rank === 1 ? 72 : 56,
                   background: rc.bg,
                   border:     `2px solid ${rc.border}`,
                   color:      rc.text,
                   fontSize:   rank === 1 ? 28 : 22,
                   boxShadow:  `0 0 20px ${rc.border}`,
                 }}>
              {student.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 text-base leading-none">{tier.emoji}</span>
          {rank === 1 && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute -top-3 -right-2 text-xl leading-none"
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {student.name?.split(' ')[0]}
          </p>
          <p className="font-display font-black text-xl" style={{ color: rc.text }}>
            <AnimatedCounter value={lc?.totalSolved ?? 0} duration={1200} />
          </p>
          <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>solved</p>
        </div>

        {/* Podium block */}
        <div
          className={`w-full flex items-center justify-center rounded-t-xl font-display font-black text-2xl ${heightClass}`}
          style={{
            background:  rc.bg,
            border:      `1px solid ${rc.border}`,
            borderBottom: 'none',
            color:        rc.text,
            minWidth:    rank === 1 ? 120 : 90,
          }}
        >
          {rc.medal}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-3 pb-0">
      <PodiumCard student={second?.student} lc={second?.leetcode} rank={2} heightClass="h-20" delay={0.15} />
      <PodiumCard student={first?.student}  lc={first?.leetcode}  rank={1} heightClass="h-28" delay={0.05} />
      <PodiumCard student={third?.student}  lc={third?.leetcode}  rank={3} heightClass="h-14" delay={0.25} />
    </div>
  );
}

// ─── Rank change indicator ─────────────────────────────────────────────────────
function RankDelta({ delta }) {
  if (!delta || delta === 0) return <Minus size={10} style={{ color: 'var(--text-muted)' }} />;
  return delta > 0
    ? <div className="flex items-center gap-0.5"><ArrowUp size={10} style={{ color: 'var(--easy)' }} /><span className="text-xs font-code" style={{ color: 'var(--easy)' }}>{delta}</span></div>
    : <div className="flex items-center gap-0.5"><ArrowDown size={10} style={{ color: 'var(--hard)' }} /><span className="text-xs font-code" style={{ color: 'var(--hard)' }}>{Math.abs(delta)}</span></div>;
}

// ─── Metric tabs ──────────────────────────────────────────────────────────────
const METRICS = [
  { key: 'totalSolved',   label: 'Total',    icon: Target   },
  { key: 'hardSolved',    label: 'Hard',     icon: Flame    },
  { key: 'mediumSolved',  label: 'Medium',   icon: TrendingUp },
  { key: 'acceptanceRate',label: 'Acc%',     icon: Trophy   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user }                          = useAuthStore();
  const { data: classData, loading } = useLeaderboard();
  const [metric, setMetric]               = useState('totalSolved');
  const [search, setSearch]               = useState('');

  const ranked = useMemo(() => {
    return [...classData]
      .filter(d => d.leetcode?.lastSynced)
      .sort((a, b) => (b.leetcode?.[metric] ?? 0) - (a.leetcode?.[metric] ?? 0));
  }, [classData, metric]);

  const unsynced = useMemo(() =>
    classData.filter(d => !d.leetcode?.lastSynced),
    [classData]
  );

  const filtered = useMemo(() =>
    ranked.filter(d =>
      d.student.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.student.leetcodeUsername ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [ranked, search]
  );

  const myRank = useMemo(() => {
    const idx = ranked.findIndex(d => d.student._id === user?._id || d.student.email === user?.email);
    return idx === -1 ? null : idx + 1;
  }, [ranked, user]);

  const myData = useMemo(() =>
    ranked.find(d => d.student._id === user?._id || d.student.email === user?.email),
    [ranked, user]
  );

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="font-display font-black text-2xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={22} style={{ color: 'var(--medium)' }} />
            Leaderboard
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {ranked.length} students ranked · {unsynced.length} not yet synced
          </p>
        </div>

        {/* My rank chip */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl self-start sm:self-auto"
            style={{
              background: 'var(--accent-glow)',
              border:     '1px solid var(--accent)',
            }}
          >
            <div>
              <p className="text-xs font-code" style={{ color: 'var(--accent)' }}>Your Rank</p>
              <p className="font-display font-black text-2xl leading-none" style={{ color: 'var(--accent)' }}>
                #{myRank}
              </p>
            </div>
            {myData && (
              <div className="text-right border-l pl-3" style={{ borderColor: 'rgba(74,222,128,0.2)' }}>
                <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>solved</p>
                <p className="font-display font-black text-2xl leading-none" style={{ color: 'var(--text-primary)' }}>
                  {myData.leetcode?.totalSolved ?? 0}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Metric selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      >
        {METRICS.map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMetric(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: metric === key ? 'var(--surface)' : 'transparent',
              color:      metric === key ? 'var(--accent)' : 'var(--text-muted)',
              border:     metric === key ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <Icon size={13} /> {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Podium */}
      {!loading && ranked.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card overflow-hidden"
          style={{ paddingTop: 32, paddingBottom: 0 }}
        >
          <Podium students={ranked.slice(0, 3)} />
          <div className="h-3 mt-4" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }} />
        </motion.div>
      )}

      {/* Rankings table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card overflow-hidden"
      >
        {/* Search row */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Full Rankings
          </h3>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-4 py-2 rounded-xl text-xs font-code outline-none w-40 transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5"><CardSkeleton lines={8} /></div>
        ) : !ranked.length ? (
          <div className="py-16 text-center">
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
              No synced students yet. Students must sync their LeetCode accounts.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <AnimatePresence initial={false}>
              {filtered.map((item, i) => {
                const rank    = ranked.indexOf(item) + 1;
                const tier    = getTier(item.leetcode?.totalSolved ?? 0);
                const rc      = rankColors[rank];
                const isMe    = item.student._id === user?._id || item.student.email === user?.email;
                const metricVal = item.leetcode?.[metric];

                return (
                  <motion.div
                    key={item.student._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 transition-colors"
                    style={{
                      background: isMe ? 'var(--accent-glow)' : 'transparent',
                      borderLeft: isMe ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      {rc ? (
                        <span className="text-lg">{rc.medal}</span>
                      ) : (
                        <span className="font-display font-bold text-base" style={{ color: 'var(--text-muted)' }}>
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        {item.student.avatar ? (
                          <img src={item.student.avatar} alt=""
                               className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
                               style={{
                                 background: rc ? rc.bg : 'var(--bg-2)',
                                 border:     `1px solid ${rc ? rc.border : 'var(--border)'}`,
                                 color:      rc ? rc.text : 'var(--text-secondary)',
                               }}>
                            {item.student.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">
                          {tier.emoji}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {item.student.name}
                          </span>
                          {isMe && (
                            <span className="text-xs font-code px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.3)' }}>
                              you
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-code" style={{ color: tier.color }}>
                            {tier.label}
                          </span>
                          {item.student.leetcodeUsername && (
                            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                              · @{item.student.leetcodeUsername}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>


                    {/* Diff counts */}
<div className="hidden md:flex items-center gap-3 flex-shrink-0">
  {[
    { val: item.leetcode?.easySolved,   color: 'var(--easy)',   label: 'E' },
    { val: item.leetcode?.mediumSolved, color: 'var(--medium)', label: 'M' },
    { val: item.leetcode?.hardSolved,   color: 'var(--hard)',   label: 'H' },
  ].map(({ val, color, label }) => (
    <div key={label} className="flex flex-col items-center" style={{ minWidth: 28 }}>
      <span className="font-display font-bold text-sm" style={{ color }}>
        {val ?? 0}
      </span>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
        {label}
      </span>
    </div>
  ))}
</div>

{/* Separator */}
<div className="hidden md:block w-px h-8 flex-shrink-0"
     style={{ background: 'var(--border)' }} />

{/* Active metric — keep as-is but add flex-shrink-0 and min-width */}
<div className="text-right flex-shrink-0" style={{ minWidth: 56 }}>
  <p className="font-display font-black text-xl"
     style={{ color: rc ? rc.text : 'var(--text-primary)' }}>
    {metric === 'acceptanceRate'
      ? `${metricVal ?? 0}%`
      : (metricVal ?? 0)}
  </p>
  <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
    {METRICS.find(m => m.key === metric)?.label}
  </p>
</div>

                    {/* Sync indicator */}
                    <div className="flex-shrink-0">
                      {item.leetcode?.lastSynced
                        ? <Wifi size={12} style={{ color: 'var(--easy)' }} title={`Synced ${relativeTime(new Date(item.leetcode.lastSynced).getTime())}`} />
                        : <WifiOff size={12} style={{ color: 'var(--text-muted)' }} />
                      }
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Unsynced section */}
      {unsynced.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-5"
        >
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
            <WifiOff size={13} /> Not Yet Synced ({unsynced.length})
          </h3>
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
    </div>
  );
}