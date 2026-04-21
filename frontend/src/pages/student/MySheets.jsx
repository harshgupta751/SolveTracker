import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence }        from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
  Circle, Clock, StickyNote, Trophy, Filter, Plus, User, Lock,
  Trash2, Edit,
} from 'lucide-react';
import toast                  from 'react-hot-toast';
import { useSheets }          from '@/hooks/useSheets';
import { sheetsAPI }          from '@/api';
import DifficultyBadge        from '@/components/shared/DifficultyBadge';
import { CardSkeleton }       from '@/components/shared/LoadingPulse';
import { formatDate }         from '@/lib/utils';
import CreatePersonalSheet    from './CreatePersonalSheet';

// ─── Progress ring (reuse from before) ───────────────────────────────────────
function ProgressRing({ pct, size = 52, stroke = 5 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            style={{ fill: 'var(--accent)', fontSize: 11, fontWeight: 700,
                     fontFamily: 'JetBrains Mono', transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Sheet card (same as before — reused) ─────────────────────────────────────
function SheetCard({ sheet, progress, onToggle, delay = 0, isPersonal = false, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [filter,   setFilter]   = useState('all');

  const completedSet = new Set(progress ?? []);
  const totalDone    = completedSet.size;
  const pct          = sheet.problems.length
    ? Math.round((totalDone / sheet.problems.length) * 100) : 0;
  const allDone = pct === 100;

  const filtered = sheet.problems.filter((_, i) => {
    if (filter === 'done') return completedSet.has(i);
    if (filter === 'todo') return !completedSet.has(i);
    return true;
  });

  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  sheet.problems.forEach((p) => diffCounts[p.difficulty]++);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
      className="card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <ProgressRing pct={pct} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base truncate"
                    style={{ color: 'var(--text-primary)' }}>
                  {sheet.title}
                </h3>
                {isPersonal && (
                  <span className="text-xs font-code px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.3)' }}>
                    <Lock size={9} /> Personal
                  </span>
                )}
                {allDone && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                               className="px-2 py-0.5 rounded-full text-xs font-semibold"
                               style={{ background: 'var(--easy-bg)', color: 'var(--easy)', border: '1px solid var(--easy)' }}>
                    ✓ Complete
                  </motion.span>
                )}
              </div>
              {sheet.description && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {sheet.description}
                </p>
              )}
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
                {Object.entries(diffCounts).filter(([, c]) => c > 0).map(([d, c]) => (
                  <span key={d} className="text-xs font-code"
                        style={{ color: `var(--${d.toLowerCase()})` }}>
                    {c} {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isPersonal && onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--hard)', background: 'var(--hard-bg)' }}
                title="Delete sheet"
              >
                <Trash2 size={12} />
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                           onClick={() => setExpanded((v) => !v)}
                           className="p-2 rounded-xl"
                           style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
          </div>
        </div>

        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div className="h-full rounded-full"
                       style={{ background: allDone ? 'var(--easy)' : 'var(--accent)' }}
                       initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                       transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.2 }} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Filter size={12} style={{ color: 'var(--text-muted)' }} />
              {[['all','All'],['todo','To Do'],['done','Done']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: filter === val ? 'var(--accent-glow)' : 'transparent',
                          border:     filter === val ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
                          color:      filter === val ? 'var(--accent)' : 'var(--text-muted)',
                        }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="divide-y">
              {filtered.map((problem, localIdx) => {
                const realIdx = sheet.problems.indexOf(problem);
                const done    = completedSet.has(realIdx);
                return (
                  <motion.div key={realIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: localIdx * 0.04 }}
                              className="flex items-center gap-4 px-5 py-3 group"
                              style={{ borderBottom: '1px solid var(--border)' }}>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                   onClick={() => onToggle(sheet._id, realIdx)}
                                   className="flex-shrink-0">
                      {done
                        ? <CheckCircle2 size={18} style={{ color: 'var(--easy)' }} />
                        : <Circle       size={18} style={{ color: 'var(--text-muted)' }} />}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
                          {String(realIdx + 1).padStart(2, '0')}
                        </span>
                        <a href={problem.url} target="_blank" rel="noreferrer"
                           className="text-sm font-medium hover:underline flex items-center gap-1"
                           style={{
                             color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                             textDecoration: done ? 'line-through' : 'none',
                           }}>
                          {problem.title}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                      </div>
                      {problem.notes && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <StickyNote size={10} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{problem.notes}</p>
                        </div>
                      )}
                    </div>

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
  const [tab,             setTab]             = useState('class');   // 'class' | 'personal'
  const [personalSheets,  setPersonalSheets]  = useState([]);
  const [personalLoading, setPersonalLoading] = useState(true);
  const [showCreate,      setShowCreate]      = useState(false);

  // Load personal sheets
  useEffect(() => {
    sheetsAPI.getPersonal()
      .then((r) => setPersonalSheets(r.data))
      .catch(() => toast.error('Failed to load personal sheets'))
      .finally(() => setPersonalLoading(false));
  }, []);

  const handleToggle = (sheetId, idx) => toggleProblem(sheetId, idx);

  const handleDeletePersonal = async (id) => {
    if (!window.confirm('Delete this personal sheet?')) return;
    try {
      await sheetsAPI.removePersonal(id);
      setPersonalSheets((prev) => prev.filter((s) => s._id !== id));
      toast.success('Sheet deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleCreatePersonal = async (data) => {
    try {
      const res = await sheetsAPI.createPersonal(data);
      setPersonalSheets((prev) => [res.data, ...prev]);
      setShowCreate(false);
      toast.success(`"${res.data.title}" created! 🎉`);
    } catch (err) { toast.error(err.message || 'Create failed'); }
  };

  const totalProblems = sheets.reduce((s, sh) => s + sh.problems.length, 0);
  const totalDone     = sheets.reduce((s, sh) => s + getSheetProgress(sh._id).length, 0);
  const overallPct    = totalProblems ? Math.round((totalDone / totalProblems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            My Sheets
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Class sheets from your instructor · personal practice sheets you create
          </p>
        </div>
        {tab === 'personal' && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#0a0a0f' }}
          >
            <Plus size={14} /> New Sheet
          </motion.button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit"
           style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        {[
          { key: 'class',    label: 'Class Sheets',    icon: BookOpen, count: sheets.length         },
          { key: 'personal', label: 'My Sheets',       icon: User,     count: personalSheets.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === key ? 'var(--surface)' : 'transparent',
              color:      tab === key ? 'var(--accent)'  : 'var(--text-muted)',
              border:     tab === key ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <Icon size={13} /> {label}
            <span className="text-xs font-code px-1.5 py-0.5 rounded-full"
                  style={{ background: tab === key ? 'var(--accent-glow)' : 'var(--border)', color: tab === key ? 'var(--accent)' : 'var(--text-muted)' }}>
              {count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Class sheets tab */}
      <AnimatePresence mode="wait">
        {tab === 'class' && (
          <motion.div key="class" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-4">
            {totalProblems > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Overall progress across all class sheets
                </p>
                <p className="font-display font-black text-xl" style={{ color: 'var(--accent)' }}>
                  {overallPct}% · {totalDone}/{totalProblems}
                </p>
              </div>
            )}

            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-5"><CardSkeleton lines={4} /></div>
              ))
            ) : !sheets.length ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-16 text-center">
                <BookOpen size={36} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
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
                  onToggle={handleToggle}
                  delay={i * 0.07}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Personal sheets tab */}
        {tab === 'personal' && (
          <motion.div key="personal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-4">
            {personalLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-5"><CardSkeleton lines={4} /></div>
              ))
            ) : !personalSheets.length ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-16 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)' }}>
                  <Plus size={24} style={{ color: '#4285f4' }} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  No personal sheets yet
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Create your own practice sheets to track personal goals.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
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
                  onToggle={handleToggle}
                  delay={i * 0.07}
                  isPersonal
                  onDelete={() => handleDeletePersonal(sheet._id)}
                />
              ))
            )}
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