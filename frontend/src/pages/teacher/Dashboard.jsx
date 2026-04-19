import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, BookOpen, BarChart3,
  ChevronRight, Copy, Check, Search, ArrowUpDown,
  Trophy, AlertTriangle, Clock, Wifi, WifiOff, Edit, Eye, EyeOff, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { useClassAnalytics } from '@/hooks/useAnalytics';
import { StatSkeleton, CardSkeleton } from '@/components/shared/LoadingPulse';
import ClassHeatmap from '@/components/charts/ClassHeatmap';
import DifficultyDonut from '@/components/charts/DifficultyDonut';
import GeminiInsight from '@/components/ai/ClaudeInsight';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { formatNumber, relativeTime, formatDate } from '@/lib/utils';
import { useSheets } from '@/hooks/useSheets';


// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
      whileHover={{ y: -3 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="font-display font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
        <AnimatedCounter value={typeof value === 'number' ? value : 0} />
        {typeof value === 'string' && value}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </motion.div>
  );
}

// ─── Student row ──────────────────────────────────────────────────────────────
function StudentRow({ item, rank, onClick }) {
  const { student, leetcode } = item;
  const synced = !!leetcode?.lastSynced;

  return (
    <motion.tr
      whileHover={{ backgroundColor: 'var(--bg-2)' }}
      onClick={onClick}
      className="cursor-pointer transition-colors border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Rank */}
      <td className="py-3 px-4 w-10">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
        </span>
      </td>

      {/* Student info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {student.avatar ? (
              <img src={student.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display"
                   style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                {student.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    background:  synced ? 'var(--easy)' : 'var(--text-muted)',
                    borderColor: 'var(--surface)',
                  }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{student.name}</p>
            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              {student.leetcodeUsername ? `@${student.leetcodeUsername}` : 'No LC username'}
            </p>
          </div>
        </div>
      </td>

      {/* Difficulty donut */}
      <td className="py-3 px-4">
        <div className="flex items-center justify-center">
          <DifficultyDonut
            easy={leetcode?.easySolved}
            medium={leetcode?.mediumSolved}
            hard={leetcode?.hardSolved}
            size={48}
          />
        </div>
      </td>

      {/* Solved counts */}
      <td className="py-3 px-4 text-center">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--easy)' }}>
          {leetcode?.easySolved ?? '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--medium)' }}>
          {leetcode?.mediumSolved ?? '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--hard)' }}>
          {leetcode?.hardSolved ?? '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          {leetcode?.totalSolved ?? '—'}
        </span>
      </td>

      {/* Acceptance */}
      <td className="py-3 px-4 text-center">
        <span className="text-sm font-code" style={{ color: 'var(--text-secondary)' }}>
          {leetcode?.acceptanceRate ? `${leetcode.acceptanceRate}%` : '—'}
        </span>
      </td>

      {/* Last synced */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          {synced
            ? <><Wifi size={11} style={{ color: 'var(--easy)' }} />
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                  {relativeTime(new Date(leetcode.lastSynced).getTime())}
                </span></>
            : <><WifiOff size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Never</span></>
          }
        </div>
      </td>

      {/* Chevron */}
      <td className="py-3 px-4 w-8">
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
      </td>
    </motion.tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { classData, topicData, loading, error, refetch } = useClassAnalytics();
  const { sheets, loading: sheetsLoading, removeSheet } = useSheets();

  const [search,    setSearch]    = useState('');
  const [sortBy,    setSortBy]    = useState('totalSolved');
  const [sortDir,   setSortDir]   = useState('desc');
  const [codeCopied, setCodeCopied] = useState(false);

  const copyClassCode = () => {
    navigator.clipboard.writeText(user?.myClassCode ?? '');
    setCodeCopied(true);
    toast.success('Class code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  // Derived stats
  const synced        = classData.filter(d => d.leetcode?.lastSynced);
  const avgSolved     = synced.length
    ? Math.round(synced.reduce((s, d) => s + (d.leetcode?.totalSolved ?? 0), 0) / synced.length)
    : 0;
  const avgAcceptance = synced.length
    ? +(synced.reduce((s, d) => s + (d.leetcode?.acceptanceRate ?? 0), 0) / synced.length).toFixed(1)
    : 0;
  const topStudent    = synced.sort((a, b) => (b.leetcode?.totalSolved ?? 0) - (a.leetcode?.totalSolved ?? 0))[0];

  // Filtered + sorted students
  const filtered = classData
    .filter(d => d.student.name.toLowerCase().includes(search.toLowerCase())
              || d.student.email.toLowerCase().includes(search.toLowerCase())
              || (d.student.leetcodeUsername ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const key = sortBy;
      const av = a.leetcode?.[key] ?? -1;
      const bv = b.leetcode?.[key] ?? -1;
      return sortDir === 'desc' ? bv - av : av - bv;
    });

  const SortBtn = ({ col, label }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 group"
      style={{ color: sortBy === col ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {label}
      <ArrowUpDown size={10} className="opacity-60 group-hover:opacity-100" />
    </button>
  );

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Top bar: class code badge ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
      >
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
            Class Overview
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {classData.length} enrolled · {synced.length} synced
          </p>
        </div>

        <motion.button
          onClick={copyClassCode}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-code font-semibold transition-all self-start"
          style={{
            background:  'var(--accent-glow)',
            border:      '1px solid var(--accent)',
            color:       'var(--accent)',
          }}
        >
          {codeCopied ? <Check size={14} /> : <Copy size={14} />}
          Class Code: <strong>{user?.myClassCode ?? '—'}</strong>
          <span className="text-xs opacity-60">(share with students)</span>
        </motion.button>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Students" value={classData.length}  sub="enrolled in class"      icon={Users}       color="var(--accent)"  delay={0}    />
            <StatCard label="Avg Solved"      value={avgSolved}         sub="problems per student"   icon={TrendingUp}  color="var(--easy)"    delay={0.07} />
            <StatCard label="Avg Acceptance"  value={`${avgAcceptance}%`} sub="across synced students" icon={BarChart3} color="var(--medium)"  delay={0.14} />
            <StatCard
              label="Top Student"
              value={topStudent?.leetcode?.totalSolved ?? 0}
              sub={topStudent?.student?.name ?? 'No data yet'}
              icon={Trophy}
              color="var(--hard)"
              delay={0.21}
            />
          </>
        )}
      </div>

      {/* ── AI Insight + heatmap ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Heatmap — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Class Topic Heatmap
            </h3>
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              avg solved / student
            </span>
          </div>
          {loading ? <CardSkeleton lines={6} /> : <ClassHeatmap topicData={topicData} />}
        </motion.div>

        {/* Claude insight — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="card p-5 lg:col-span-2"
        >
          <GeminiInsight
            mode="teacher"
            classData={classData}
            topicData={topicData}
          />
        </motion.div>
      </div>

      {/* ── Student table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="card overflow-hidden"
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Student Roster
          </h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-8 pr-4 py-2 rounded-xl text-xs font-code outline-none transition-all w-48"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e  => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e   => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5"><CardSkeleton lines={6} /></div>
        ) : !classData.length ? (
          <div className="py-16 text-center">
            <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
              No students enrolled yet. Share your class code!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: '#',     col: null },
                    { label: 'Student', col: null },
                    { label: 'Split',   col: null },
                    { label: 'Easy',    col: 'easySolved' },
                    { label: 'Med',     col: 'mediumSolved' },
                    { label: 'Hard',    col: 'hardSolved' },
                    { label: 'Total',   col: 'totalSolved' },
                    { label: 'Acc%',    col: 'acceptanceRate' },
                    { label: 'Synced',  col: null },
                    { label: '',        col: null },
                  ].map(({ label, col }, i) => (
                    <th key={i} className="py-3 px-4 font-code text-xs font-medium text-center first:text-left second:text-left"
                        style={{ color: 'var(--text-muted)' }}>
                      {col ? <SortBtn col={col} label={label} /> : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((item, i) => (
                    <motion.tr
                      key={item.student._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ backgroundColor: 'var(--bg-2)' }}
                      onClick={() => navigate(`/teacher/student/${item.student._id}`)}
                      className="cursor-pointer transition-colors border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="py-3 px-4 w-10">
                        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                          {i <= 2 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {item.student.avatar ? (
                              <img src={item.student.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display"
                                   style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                                {item.student.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                  style={{ background: item.leetcode?.lastSynced ? 'var(--easy)' : 'var(--text-muted)', borderColor: 'var(--surface)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.student.name}</p>
                            <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                              {item.student.leetcodeUsername ? `@${item.student.leetcodeUsername}` : 'No LC username'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <DifficultyDonut easy={item.leetcode?.easySolved} medium={item.leetcode?.mediumSolved} hard={item.leetcode?.hardSolved} size={44} />
                        </div>
                      </td>
                      {[
                        { val: item.leetcode?.easySolved,   color: 'var(--easy)'   },
                        { val: item.leetcode?.mediumSolved, color: 'var(--medium)' },
                        { val: item.leetcode?.hardSolved,   color: 'var(--hard)'   },
                        { val: item.leetcode?.totalSolved,  color: 'var(--text-primary)' },
                      ].map(({ val, color }, j) => (
                        <td key={j} className="py-3 px-4 text-center">
                          <span className="font-display font-bold text-base" style={{ color }}>
                            {val ?? '—'}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-code" style={{ color: 'var(--text-secondary)' }}>
                          {item.leetcode?.acceptanceRate ? `${item.leetcode.acceptanceRate}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.leetcode?.lastSynced
                            ? <><Wifi size={10} style={{ color: 'var(--easy)' }} />
                                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                                  {relativeTime(new Date(item.leetcode.lastSynced).getTime())}
                                </span></>
                            : <><WifiOff size={10} style={{ color: 'var(--text-muted)' }} />
                                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Never</span></>
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4 w-8">
                        <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      {/* ── My Sheets Section ── */}
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.45 }}
  className="card overflow-hidden"
>
  {/* Section header */}
  <div
    className="flex items-center justify-between px-5 py-4"
    style={{ borderBottom: '1px solid var(--border)' }}
  >
    <div className="flex items-center gap-2">
      <BookOpen size={15} style={{ color: 'var(--accent)' }} />
      <h3
        className="font-display font-bold text-sm"
        style={{ color: 'var(--text-primary)' }}
      >
        My Problem Sheets
      </h3>
      <span
        className="text-xs font-code px-2 py-0.5 rounded-full"
        style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
      >
        {sheets.length}
      </span>
    </div>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate('/teacher/create-sheet')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={{
        background: 'var(--accent)',
        color: '#0a0a0f',
      }}
    >
      <Plus size={12} /> New Sheet
    </motion.button>
  </div>

  {/* Sheet rows */}
  {sheetsLoading ? (
    <div className="p-5">
      <CardSkeleton lines={3} />
    </div>
  ) : !sheets.length ? (
    <div className="py-14 text-center">
      <BookOpen size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
        No sheets yet. Create your first problem set!
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/teacher/create-sheet')}
        className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold"
        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
      >
        + Create Sheet
      </motion.button>
    </div>
  ) : (
    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {sheets.map((sheet, i) => {
        const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
        (sheet.problems ?? []).forEach((p) => diffCounts[p.difficulty]++);

        return (
          <motion.div
            key={sheet._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {/* Sheet info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-semibold text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {sheet.title}
                </span>

                {/* Published / Draft badge */}
                <span
                  className="text-xs font-code px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: sheet.isPublished ? 'var(--easy-bg)' : 'var(--border)',
                    color: sheet.isPublished ? 'var(--easy)' : 'var(--text-muted)',
                    border: sheet.isPublished ? '1px solid var(--easy)' : '1px solid transparent',
                  }}
                >
                  {sheet.isPublished
                    ? <><Eye size={9} /> Published</>
                    : <><EyeOff size={9} /> Draft</>
                  }
                </span>
              </div>

              {/* Meta: problem count + difficulty breakdown + due date */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                  {sheet.problems?.length ?? 0} problems
                </span>
                {Object.entries(diffCounts)
                  .filter(([, c]) => c > 0)
                  .map(([d, c]) => (
                    <span
                      key={d}
                      className="text-xs font-code"
                      style={{ color: `var(--${d.toLowerCase()})` }}
                    >
                      {c} {d}
                    </span>
                  ))}
                {sheet.dueDate && (
                  <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                    Due {formatDate(sheet.dueDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* ✅ THIS IS THE EDIT BUTTON */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(`/teacher/edit-sheet/${sheet._id}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                title="Edit sheet"
              >
                <Edit size={12} /> Edit
              </motion.button>

              {/* Delete button */}
              <motion.button
                whileHover={{ scale: 1.08, borderColor: 'var(--hard)' }}
                whileTap={{ scale: 0.94 }}
                onClick={async () => {
                  if (
                    window.confirm(
                      `Delete "${sheet.title}"? This cannot be undone.`
                    )
                  ) {
                    try {
                      await removeSheet(sheet._id);
                      toast.success('Sheet deleted');
                    } catch {
                      toast.error('Delete failed');
                    }
                  }
                }}
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                style={{
                  background: 'var(--hard-bg)',
                  border: '1px solid transparent',
                  color: 'var(--hard)',
                }}
                title="Delete sheet"
              >
                <Trash2 size={12} />
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  )}
</motion.div>
    </div>
  );
}