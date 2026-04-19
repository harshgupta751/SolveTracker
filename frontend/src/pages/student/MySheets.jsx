import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
  Circle, Clock, StickyNote, Trophy, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSheets } from '@/hooks/useSheets';
import { leetcodeAPI } from '@/api';
import DifficultyBadge from '@/components/shared/DifficultyBadge';
import { CardSkeleton } from '@/components/shared/LoadingPulse';
import { formatDate } from '@/lib/utils';

// ─── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 52, stroke = 5 }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            className="rotate-90" style={{ fill: 'var(--accent)', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Single sheet card ─────────────────────────────────────────────────────────
function SheetCard({ sheet, progress, onToggle, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter]     = useState('all'); // 'all' | 'done' | 'todo'

  const completedSet = new Set(progress?.completedProblems ?? []);
  const totalDone    = completedSet.size;
  const pct          = sheet.problems.length
    ? Math.round((totalDone / sheet.problems.length) * 100)
    : 0;

  const allDone = pct === 100;

  const filtered = sheet.problems.filter((_, i) => {
    if (filter === 'done') return completedSet.has(i);
    if (filter === 'todo') return !completedSet.has(i);
    return true;
  });

  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  sheet.problems.forEach(p => diffCounts[p.difficulty]++);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
      className="card overflow-hidden"
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <ProgressRing pct={pct} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base truncate"
                    style={{ color: 'var(--text-primary)' }}>
                  {sheet.title}
                </h3>
                {allDone && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--easy-bg)', color: 'var(--easy)', border: '1px solid var(--easy)' }}
                  >
                    ✓ Complete
                  </motion.span>
                )}
              </div>
              {sheet.description && (
                <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {sheet.description}
                </p>
              )}
              {/* Meta */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                  {totalDone}/{sheet.problems.length} solved
                </span>
                {sheet.dueDate && (
                  <span className="flex items-center gap-1 text-xs font-code"
                        style={{ color: new Date(sheet.dueDate) < new Date() ? 'var(--hard)' : 'var(--text-muted)' }}>
                    <Clock size={10} /> Due {formatDate(sheet.dueDate)}
                  </span>
                )}
                {/* Diff chips */}
                {Object.entries(diffCounts).filter(([, c]) => c > 0).map(([d, c]) => (
                  <span key={d} className="text-xs font-code"
                        style={{ color: `var(--${d.toLowerCase()})` }}>
                    {c} {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Expand toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(v => !v)}
            className="flex-shrink-0 p-2 rounded-xl transition-colors"
            style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: allDone ? 'var(--easy)' : 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.2 }}
          />
        </div>
      </div>

      {/* Problem list */}
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
            {/* Filter tabs */}
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Filter size={12} style={{ color: 'var(--text-muted)' }} />
              {[['all', 'All'], ['todo', 'To Do'], ['done', 'Done']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filter === val ? 'var(--accent-glow)' : 'transparent',
                    border:     filter === val ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
                    color:      filter === val ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Problems */}
            <div className="divide-y" style={{ '--divide-color': 'var(--border)' }}>
              {filtered.map((problem, localIdx) => {
                const realIdx = sheet.problems.indexOf(problem);
                const done    = completedSet.has(realIdx);

                return (
                  <motion.div
                    key={realIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: localIdx * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3 group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    {/* Check toggle */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggle(sheet._id, realIdx)}
                      className="flex-shrink-0 transition-colors"
                    >
                      {done
                        ? <CheckCircle2 size={18} style={{ color: 'var(--easy)' }} />
                        : <Circle       size={18} style={{ color: 'var(--text-muted)' }} />
                      }
                    </motion.button>

                    {/* Problem info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
                          {String(realIdx + 1).padStart(2, '0')}
                        </span>
                        <a
                          href={problem.url} target="_blank" rel="noreferrer"
                          className="text-sm font-medium hover:underline flex items-center gap-1 group-hover:text-[var(--accent)] transition-colors"
                          style={{
                            color:                 done ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration:        done ? 'line-through' : 'none',
                            textDecorationColor:   'var(--text-muted)',
                            textUnderlineOffset:   '3px',
                          }}
                        >
                          {problem.title}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                      </div>
                      {/* Notes */}
                      {problem.notes && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <StickyNote size={10} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                            {problem.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: difficulty + topic */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-code hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                        {problem.topic}
                      </span>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MySheets() {
const { sheets, loading, toggleProblem, getSheetProgress } = useSheets();
  const [localProgress, setLocalProgress] = useState({});

const handleToggle = (sheetId, idx) => toggleProblem(sheetId, idx);


  // Summary stats
  const totalProblems = sheets.reduce((s, sh) => s + sh.problems.length, 0);
  const totalDone     = Object.values(localProgress).reduce((s, arr) => s + arr.length, 0);
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
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            My Sheets
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {sheets.length} active sheets from your instructor
          </p>
        </div>

        {totalProblems > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-right"
          >
            <p className="font-display font-black text-2xl" style={{ color: 'var(--accent)' }}>
              {overallPct}%
            </p>
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              overall · {totalDone}/{totalProblems}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Empty / loading / list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5"><CardSkeleton lines={4} /></div>
          ))}
        </div>
      ) : !sheets.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-16 text-center"
        >
          <BookOpen size={36} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            No sheets yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your teacher hasn't published any problem sheets. Check back soon!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sheets.map((sheet, i) => (
            <SheetCard
              key={sheet._id}
              sheet={sheet}
              progress={{ completedProblems: getSheetProgress(sheet._id) }}
              onToggle={handleToggle}
              delay={i * 0.08}
            />
          ))}
        </div>
      )}

      {/* Completion celebration */}
      <AnimatePresence>
        {overallPct === 100 && totalProblems > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="card p-6 text-center"
            style={{ border: '1px solid var(--easy)', background: 'var(--easy-bg)' }}
          >
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--easy)' }} />
            <h3 className="font-display font-black text-xl" style={{ color: 'var(--easy)' }}>
              All sheets complete! 🏆
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              You've solved every problem in all sheets. Absolute legend.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}