import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, TrendingUp, Users, PlusSquare, Trophy, LogOut, ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import ThemeToggle from './ThemeToggle';

const studentNav = [
  { to: '/student',             icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/student/sheets',      icon: BookOpen,        label: 'My Sheets' },
  { to: '/student/progress',    icon: TrendingUp,      label: 'Progress' },
  { to: '/student/leaderboard', icon: Trophy,          label: 'Leaderboard' },
];

const teacherNav = [
  { to: '/teacher',              icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/teacher/create-sheet', icon: PlusSquare,      label: 'New Sheet' },
  { to: '/teacher/leaderboard',  icon: Trophy,          label: 'Leaderboard' },
];

export default function Sidebar() {
  const { user, logout, isTeacher } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = isTeacher() ? teacherNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col flex-shrink-0 h-screen overflow-hidden relative z-20"
      style={{
        background:  'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                   style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
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
                  background:   isActive ? 'var(--accent-glow)' : 'transparent',
                  border:       isActive ? '1px solid rgba(74,222,128,0.20)' : '1px solid transparent',
                  color:        isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  boxShadow:    isActive ? '0 0 12px rgba(34,197,94,0.10)' : 'none',
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

      {/* ── Bottom user section ── */}
      <div className="px-3 pb-4 space-y-2 flex-shrink-0"
           style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>

        {/* Theme toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
          {!collapsed && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Theme</span>
          )}
          <ThemeToggle compact />
        </div>

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
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display"
                   style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--easy)', border: '2px solid var(--surface)' }} />
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