import { NavLink, useNavigate }    from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, TrendingUp, Users,
  PlusSquare, Trophy, LogOut, ChevronRight, Zap,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import useAuthStore   from '@/store/authStore';
import { leetcodeAPI } from '@/api';

// ─── Nav configs ──────────────────────────────────────────────────────────────
const studentNav = [
  { to: '/student',             icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/student/sheets',      icon: BookOpen,        label: 'My Sheets' },
  { to: '/student/progress',    icon: TrendingUp,      label: 'Progress' },
  { to: '/student/leaderboard', icon: Trophy,          label: 'Leaderboard' },
];

const teacherNav = [
  { to: '/teacher',              icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/teacher/students',     icon: Users,           label: 'Students' },
  { to: '/teacher/create-sheet', icon: PlusSquare,      label: 'New Sheet' },
  { to: '/teacher/leaderboard',  icon: Trophy,          label: 'Leaderboard' },
];

// ─── Mini Streak — last 5 days of activity ───────────────────────────────────
function MiniStreak() {
  const [submissions, setSubmissions] = useState([]);

  // Fetch cached stats on mount, re-fetch on sync
  useEffect(() => {
    leetcodeAPI.getStats()
      .then(res => setSubmissions(res.data.leetcode?.recentSubmissions ?? []))
      .catch(() => {});

    const onSync = (e) => setSubmissions(e.detail?.recentSubmissions ?? []);
    window.addEventListener('leetcode-synced', onSync);
    return () => window.removeEventListener('leetcode-synced', onSync);
  }, []);

  // Build last-5-days heatmap
  const days = useMemo(() => {
    const map = {};
    submissions.forEach(({ timestamp }) => {
      const d = new Date(timestamp * 1000);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[k]  = (map[k] || 0) + 1;
    });

    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - i));
      const k     = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const count = map[k] || 0;
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { count, label, isToday: i === 4 };
    });
  }, [submissions]);

  const streak = useMemo(() => {
    let s = 0;
    const map = {};
    submissions.forEach(({ timestamp }) => {
      const d = new Date(timestamp * 1000);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[k]  = true;
    });
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (map[k]) s++; else if (i > 0) break;
    }
    return s;
  }, [submissions]);

  const getColor = (count) => {
    if (count === 0) return 'var(--border)';
    if (count <= 2)  return 'rgba(74,222,128,0.45)';
    return 'var(--accent)';
  };

  const totalSolved5 = days.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
          5-day activity
        </span>
        {streak > 0 && (
          <span className="text-xs font-display font-bold flex items-center gap-0.5"
                style={{ color: 'var(--accent)', fontSize: 10 }}>
            🔥 {streak}d
          </span>
        )}
      </div>

      {/* Squares */}
      <div className="flex items-end gap-1 justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              title={`${day.label}: ${day.count} solved`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
              style={{
                width:        day.isToday ? 14 : 12,
                height:       day.isToday ? 14 : 12,
                borderRadius: 3,
                background:   getColor(day.count),
                boxShadow:    day.count > 0 ? '0 0 6px rgba(74,222,128,0.3)' : 'none',
                border:       day.isToday ? '1px solid var(--accent)' : '1px solid transparent',
              }}
            />
            <span style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {day.label[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Sub-text */}
      <p className="text-center mt-1.5" style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
        {totalSolved5 > 0 ? `${totalSolved5} solved this week` : 'No activity yet'}
      </p>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, logout, isTeacher } = useAuthStore();
  const navigate  = useNavigate();
  const teacher   = isTeacher();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = teacher ? teacherNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col flex-shrink-0 h-screen overflow-hidden relative z-20"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-between px-4 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
              >
                <Zap size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <span className="font-display font-bold text-base tracking-tight"
                    style={{ color: 'var(--text-primary)' }}>
                DSA<span style={{ color: 'var(--accent)' }}>&Chill</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg"
               style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <Zap size={14} style={{ color: 'var(--accent)' }} />
          </div>
        )}

        {!collapsed && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  border:     isActive ? '1px solid rgba(74,222,128,0.20)' : '1px solid transparent',
                  color:      isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  boxShadow:  isActive ? '0 0 12px rgba(34,197,94,0.10)' : 'none',
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom section ── */}
      <div
        className="px-3 pb-4 space-y-2.5 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}
      >
        {/* 5-day streak — only for students, only when expanded */}
        {!teacher && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MiniStreak />
          </motion.div>
        )}

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            title="Expand sidebar"
          >
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}

        {/* User profile card */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${collapsed ? 'justify-center' : ''}`}
          style={{ background: 'var(--bg-3)' }}
        >
          <div className="relative flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name}
                   className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--easy)', border: '2px solid var(--surface)' }}
            />
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.name ?? 'User'}
                </p>
                <p className="text-xs truncate capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user?.role ?? 'student'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex-shrink-0 p-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Logout"
            >
              <LogOut size={13} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}