import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }           from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink,
  CheckCircle2, Circle, Clock, StickyNote, Trophy,
  Filter, Plus, User, Lock, Trash2, ShieldCheck, Loader2,
} from 'lucide-react';
import toast               from 'react-hot-toast';
import { useSheets }       from '@/hooks/useSheets';
import { sheetsAPI, leetcodeAPI } from '@/api';
import DifficultyBadge     from '@/components/shared/DifficultyBadge';
import { CardSkeleton }    from '@/components/shared/LoadingPulse';
import { formatDate }      from '@/lib/utils';
import CreatePersonalSheet from './CreatePersonalSheet';

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 52, stroke = 5 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? 'var(--easy)' : 'var(--accent)'}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="middle" textAnchor="middle"
        style={{
          fill:            pct === 100 ? 'var(--easy)' : 'var(--accent)',
          fontSize:        11,
          fontWeight:      700,
          fontFamily:      'JetBrains Mono, monospace',
          transform:       'rotate(90deg)',
          transformOrigin: '50% 50%',
        }}
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Verify Button ────────────────────────────────────────────────────────────
// Once verified, renders a static badge — button is gone, no re-click possible.
function VerifyButton({ onVerify, verified }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (verified || loading) return;
    setLoading(true);
    await onVerify();
    setLoading(false);
  };

  // Already verified — show static badge, no button
  if (verified) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold select-none"
        style={{
          background: 'var(--easy-bg)',
          border:     '1px solid rgba(74,222,128,0.30)',
          color:      'var(--easy)',
        }}
      >
        <ShieldCheck size={11} />
        Verified
      </div>
    );
  }

  // Not yet verified — show active verify button
  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.06, y: loading ? 0 : -1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                 transition-all disabled:cursor-not-allowed whitespace-nowrap"
      style={{
        background: loading
          ? 'var(--bg-2)'
          : 'linear-gradient(135deg, rgba(66,133,244,0.18) 0%, rgba(66,133,244,0.08) 100%)',
        border: loading
          ? '1px solid var(--border)'
          : '1px solid rgba(66,133,244,0.40)',
        color:     loading ? 'var(--text-muted)' : '#4285f4',
        boxShadow: loading ? 'none' : '0 2px 8px rgba(66,133,244,0.12)',
      }}
    >
      {loading
        ? <Loader2 size={11} className="animate-spin" />
        : <ShieldCheck size={11} />
      }
      {loading ? 'Checking…' : 'Verify'}
    </motion.button>
  );
}

// ─── Sheet Card ───────────────────────────────────────────────────────────────
function SheetCard({
  sheet,
  progress         = [],
  verifiedProblems = [],
  onVerify,
  delay            = 0,
  isPersonal       = false,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false);
  const [filter,   setFilter]   = useState('all');

  const completedSet  = new Set(progress);
  const verifiedSet   = new Set(verifiedProblems);
  const totalDone     = completedSet.size;
  const totalVerified = verifiedSet.size;
  const pct = sheet.problems.length
    ? Math.round((totalDone / sheet.problems.length) * 100) : 0;
  const allDone = pct === 100;

  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  sheet.problems.forEach(p => diffCounts[p.difficulty]++);

  const filtered = sheet.problems.filter((_, i) => {
    if (filter === 'done') return completedSet.has(i);
    if (filter === 'todo') return !completedSet.has(i);
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
      className="card overflow-hidden"
      style={{
        boxShadow: allDone
          ? '0 0 0 1px rgba(74,222,128,0.20), 0 4px 24px rgba(74,222,128,0.06)'
          : undefined,
      }}
    >
      {/* ── Card header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <ProgressRing pct={pct} />
            <div className="flex-1 min-w-0">
              {/* Title + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-display font-bold text-base truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {sheet.title}
                </h3>
                {isPersonal && (
                  <span
                    className="text-xs font-code px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background: 'rgba(66,133,244,0.10)',
                      color:      '#4285f4',
                      border:     '1px solid rgba(66,133,244,0.28)',
                    }}
                  >
                    <Lock size={9} /> Personal
                  </span>
                )}
                {allDone && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--easy-bg)',
                      color:      'var(--easy)',
                      border:     '1px solid rgba(74,222,128,0.35)',
                    }}
                  >
                    <CheckCircle2 size={9} /> Complete
                  </motion.span>
                )}
              </div>

              {sheet.description && (
                <p className="text-sm mt-0.5 leading-snug"
                   style={{ color: 'var(--text-secondary)' }}>
                  {sheet.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                  {totalDone}/{sheet.problems.length} done
                </span>
                {totalVerified > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-code"
                    style={{ color: 'var(--easy)' }}
                  >
                    <ShieldCheck size={10} /> {totalVerified} verified
                  </span>
                )}
                {sheet.dueDate && (
                  <span
                    className="flex items-center gap-1 text-xs font-code"
                    style={{
                      color: new Date(sheet.dueDate) < new Date()
                        ? 'var(--hard)' : 'var(--text-muted)',
                    }}
                  >
                    <Clock size={10} /> Due {formatDate(sheet.dueDate)}
                  </span>
                )}
                {Object.entries(diffCounts).filter(([, c]) => c > 0).map(([d, c]) => (
                  <span key={d} className="text-xs font-code"
                        style={{ color: `var(--${d.toLowerCase()})` }}>
                    {c} {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isPersonal && onDelete && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{
                  color:      'var(--hard)',
                  background: 'var(--hard-bg)',
                  border:     '1px solid transparent',
                }}
                title="Delete sheet"
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <Trash2 size={13} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setExpanded(v => !v)}
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all"
              style={{
                background: 'var(--bg-2)',
                border:     '1px solid var(--border)',
                color:      'var(--text-secondary)',
              }}
            >
              {expanded
                ? <><ChevronUp size={13} /> Hide</>
                : <><ChevronDown size={13} /> {sheet.problems.length} problems</>
              }
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 rounded-full overflow-hidden"
             style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: allDone ? 'var(--easy)' : 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.2 }}
          />
        </div>
      </div>

      {/* ── Problem table ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {/* Filter bar */}
            <div
              className="flex items-center gap-2 px-5 py-2.5"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}
            >
              <Filter size={11} style={{ color: 'var(--text-muted)' }} />
              {[
                ['all',  'All',    sheet.problems.length],
                ['todo', 'To Do',  sheet.problems.length - totalDone],
                ['done', 'Done',   totalDone],
              ].map(([val, label, count]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filter === val ? 'var(--accent-glow)' : 'transparent',
                    border:     filter === val ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
                    color:      filter === val ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                  <span className="font-code opacity-60 ml-0.5">({count})</span>
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div
              className="hidden sm:grid px-5 py-2"
              style={{
                gridTemplateColumns: '36px 1fr 90px 52px 100px',
                gap:        '12px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-2)',
              }}
            >
              {[
                { label: '#',          align: 'left'   },
                { label: 'Problem',    align: 'left'   },
                { label: 'Difficulty', align: 'center' },
                { label: 'Status',     align: 'center' },
                { label: 'Action',     align: 'center' },
              ].map(({ label, align }) => (
                <span
                  key={label}
                  className="text-xs font-code font-semibold"
                  style={{ color: 'var(--text-muted)', textAlign: align }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div>
              {filtered.map((problem, localIdx) => {
                const realIdx  = sheet.problems.indexOf(problem);
                const done     = completedSet.has(realIdx);
                const verified = verifiedSet.has(realIdx);

                const slugMatch = problem.url?.match(/leetcode\.com\/problems\/([^/?#\s]+)/);
                const titleSlug = slugMatch?.[1] ?? null;
                const isLeetCode = !!titleSlug;

                return (
                  <motion.div
                    key={realIdx}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: localIdx * 0.025 }}
                    className="grid items-center px-5 py-3 group"
                    style={{
                      gridTemplateColumns: '36px 1fr 90px 52px 100px',
                      gap:        '12px',
                      borderBottom: '1px solid var(--border)',
                      background: verified
                        ? 'rgba(74,222,128,0.025)'
                        : 'transparent',
                      transition: 'background 0.25s',
                    }}
                  >
                    {/* # */}
                    <span className="font-code text-xs"
                          style={{ color: 'var(--text-muted)' }}>
                      {String(realIdx + 1).padStart(2, '0')}
                    </span>

                    {/* Problem title + notes */}
                    <div className="min-w-0">
                        <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium flex items-center gap-1.5 transition-colors"
                        style={{
                          color:               done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration:      done ? 'line-through'       : 'none',
                          textDecorationColor: 'var(--border-2)',
                          textUnderlineOffset: '3px',
                        }}
                        onMouseEnter={e => {
                          if (!done) e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = done
                            ? 'var(--text-muted)' : 'var(--text-primary)';
                        }}
                      >
                        <span className="truncate">{problem.title}</span>
                        <ExternalLink
                          size={10}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                        />
                      </a>
                      {problem.notes && (
                        <div className="flex items-start gap-1 mt-0.5">
                          <StickyNote size={9} className="flex-shrink-0 mt-0.5"
                                      style={{ color: 'var(--text-muted)' }} />
                          <p className="text-xs leading-snug truncate"
                             style={{ color: 'var(--text-muted)' }}>
                            {problem.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="flex justify-center">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>

                    {/* ── STATUS column ── */}
                    {/* Green check = verified, grey check = done but unverified, empty circle = not done */}
                    <div className="flex justify-center">
                      <AnimatePresence mode="wait" initial={false}>
                        {done ? (
                          <motion.div
                            key="done"
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          >
                            <CheckCircle2
                              size={20}
                              style={{
                                color:      verified ? 'var(--easy)' : 'var(--text-muted)',
                                filter:     verified
                                  ? 'drop-shadow(0 0 4px rgba(74,222,128,0.45))'
                                  : 'none',
                                transition: 'color 0.25s, filter 0.25s',
                              }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Circle size={20} style={{ color: 'var(--border-2)' }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── ACTION column ── */}
                    {/* LeetCode URL → Verify button (disabled once verified)  */}
                    {/* No LeetCode URL → "No LC URL" hint badge               */}
                    <div className="flex justify-center">
                      {isLeetCode ? (
                        <VerifyButton
                          verified={verified}
                          onVerify={() => onVerify(sheet._id, realIdx, titleSlug)}
                        />
                      ) : (
                        <span
                          className="text-xs font-code px-2 py-1.5 rounded-lg"
                          style={{
                            background: 'var(--bg-2)',
                            border:     '1px solid var(--border)',
                            color:      'var(--text-muted)',
                            fontSize:   10,
                            whiteSpace: 'nowrap',
                          }}
                          title="Add a LeetCode URL to enable verification"
                        >
                          No LC URL
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm font-code" style={{ color: 'var(--text-muted)' }}>
                  {filter === 'done'
                    ? 'No problems verified yet — click Verify on any problem!'
                    : 'All problems are done 🎉'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MySheets() {
  const {
    sheets,
    loading,
    getSheetProgress,
    getVerifiedProblems,
    refetch: fetchSheets,
  } = useSheets();

  const [tab,             setTab]             = useState('class');
  const [personalSheets,  setPersonalSheets]  = useState([]);
  const [personalLoading, setPersonalLoading] = useState(true);
  const [showCreate,      setShowCreate]      = useState(false);

  useEffect(() => {
    sheetsAPI.getPersonal()
      .then(r  => setPersonalSheets(r.data))
      .catch(() => toast.error('Failed to load personal sheets'))
      .finally(() => setPersonalLoading(false));
  }, []);

  // Single verify handler — used for both class sheets and personal sheets.
  // Status only updates after successful LeetCode verification.
  const handleVerify = useCallback(async (sheetId, idx, titleSlug) => {
    try {
      const res = await leetcodeAPI.verifyProblem(titleSlug, sheetId, idx);
      if (res.data.solved) {
        toast.success('✅ Verified on LeetCode!');
        await fetchSheets(); // re-fetch so verifiedProblems state updates → status column turns green
      } else {
        toast.error(
          res.data.message
          ?? 'Not found in your recent LeetCode submissions. Solve it on LeetCode first!'
        );
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed. Try again.');
    }
  }, [fetchSheets]);

  const handleCreatePersonal = async (data) => {
    try {
      const res = await sheetsAPI.createPersonal(data);
      setPersonalSheets(prev => [res.data, ...prev]);
      setShowCreate(false);
      toast.success(`"${res.data.title}" created! 🎉`);
    } catch (err) {
      toast.error(err.message || 'Create failed');
    }
  };

  const handleDeletePersonal = async (id) => {
    if (!window.confirm('Delete this personal sheet? This cannot be undone.')) return;
    try {
      await sheetsAPI.removePersonal(id);
      setPersonalSheets(prev => prev.filter(s => s._id !== id));
      toast.success('Sheet deleted');
    } catch { toast.error('Delete failed'); }
  };

  const totalProblems = sheets.reduce((s, sh) => s + sh.problems.length, 0);
  const totalDone     = sheets.reduce((s, sh) => s + getSheetProgress(sh._id).length, 0);
  const totalVerified = sheets.reduce((s, sh) => s + getVerifiedProblems(sh._id).length, 0);
  const overallPct    = totalProblems ? Math.round((totalDone / totalProblems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display font-black text-2xl"
              style={{ color: 'var(--text-primary)' }}>
            My Sheets
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Class sheets from your instructor · personal practice sheets
          </p>
        </div>
        {tab === 'personal' && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'var(--accent)',
              color:      '#0a0a0f',
              boxShadow:  '0 0 16px rgba(74,222,128,0.20)',
            }}
          >
            <Plus size={14} /> New Sheet
          </motion.button>
        )}
      </motion.div>

      {/* Tabs */}
      <div
        className="flex gap-1.5 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      >
        {[
          { key: 'class',    label: 'Class Sheets', icon: BookOpen, count: sheets.length         },
          { key: 'personal', label: 'Personal',     icon: User,     count: personalSheets.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === key ? 'var(--surface)' : 'transparent',
              color:      tab === key ? 'var(--accent)'  : 'var(--text-muted)',
              border:     tab === key
                ? '1px solid rgba(74,222,128,0.30)'
                : '1px solid transparent',
              boxShadow:  tab === key ? '0 0 12px rgba(74,222,128,0.08)' : 'none',
            }}
          >
            <Icon size={13} />
            {label}
            <span
              className="text-xs font-code px-1.5 py-0.5 rounded-full"
              style={{
                background: tab === key ? 'var(--accent-glow)' : 'var(--border)',
                color:      tab === key ? 'var(--accent)'       : 'var(--text-muted)',
              }}
            >
              {count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Class sheets tab ── */}
      <AnimatePresence mode="wait">
        {tab === 'class' && (
          <motion.div
            key="class"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {totalProblems > 0 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-medium"
                     style={{ color: 'var(--text-secondary)' }}>
                    Overall progress
                  </p>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: 'var(--easy-bg)',
                      border:     '1px solid rgba(74,222,128,0.25)',
                    }}
                  >
                    <ShieldCheck size={11} style={{ color: 'var(--easy)' }} />
                    <span className="text-xs font-code font-semibold"
                          style={{ color: 'var(--easy)' }}>
                      {totalVerified} verified
                    </span>
                  </div>
                </div>
                <p className="font-display font-black text-2xl"
                   style={{ color: 'var(--accent)' }}>
                  {overallPct}%
                </p>
              </div>
            )}

            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-5"><CardSkeleton lines={4} /></div>
              ))
            ) : !sheets.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-16 text-center"
              >
                <BookOpen size={36} className="mx-auto mb-4"
                          style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-display font-bold text-lg mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                  No class sheets yet
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Your teacher hasn't published any sheets. Check back soon!
                </p>
              </motion.div>
            ) : (
              sheets.map((sheet, i) => (
                <SheetCard
                  key={sheet._id}
                  sheet={sheet}
                  progress={getSheetProgress(sheet._id)}
                  verifiedProblems={getVerifiedProblems(sheet._id)}
                  onVerify={handleVerify}
                  delay={i * 0.07}
                />
              ))
            )}
          </motion.div>
        )}

        {/* ── Personal sheets tab ── */}
        {tab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {personalLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-5"><CardSkeleton lines={4} /></div>
              ))
            ) : !personalSheets.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-16 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(66,133,244,0.10)',
                    border:     '1px solid rgba(66,133,244,0.28)',
                  }}
                >
                  <Plus size={24} style={{ color: '#4285f4' }} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                  No personal sheets yet
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Build your own curated problem lists — track your personal study goals
                  with verified LeetCode submissions.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--accent)', color: '#0a0a0f' }}
                >
                  Create My First Sheet
                </motion.button>
              </motion.div>
            ) : (
              personalSheets.map((sheet, i) => (
                <SheetCard
                  key={sheet._id}
                  sheet={sheet}
                  progress={getSheetProgress(sheet._id)}
                  verifiedProblems={getVerifiedProblems(sheet._id)}
                  onVerify={handleVerify}
                  delay={i * 0.07}
                  isPersonal
                  onDelete={() => handleDeletePersonal(sheet._id)}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion celebration */}
      <AnimatePresence>
        {overallPct === 100 && totalProblems > 0 && tab === 'class' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="card p-6 text-center"
            style={{
              border:     '1px solid rgba(74,222,128,0.35)',
              background: 'var(--easy-bg)',
              boxShadow:  '0 0 32px rgba(74,222,128,0.10)',
            }}
          >
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--easy)' }} />
            <h3 className="font-display font-black text-xl" style={{ color: 'var(--easy)' }}>
              All sheets complete! 🏆
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Every problem LeetCode-verified. You're placement ready.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create personal sheet modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePersonalSheet
            onSave={handleCreatePersonal}
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}