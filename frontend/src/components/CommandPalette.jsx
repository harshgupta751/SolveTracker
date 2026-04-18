import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, BookOpen, TrendingUp, Users,
  PlusSquare, LogOut, Sun, Moon, RefreshCw, Zap, Trophy,
  ArrowRight, Command,
} from 'lucide-react';
import useCommandStore from '@/store/commandStore';
import useAuthStore    from '@/store/authStore';
import useThemeStore   from '@/store/themeStore';
import { leetcodeAPI } from '@/api';
import toast from 'react-hot-toast';

// ─── All possible commands ────────────────────────────────────────────────────
const buildCommands = ({ isTeacher, theme, toggleTheme, logout, navigate, sync, setSyncing }) => {
  const go  = (path, label) => ({ label, action: () => navigate(path) });
  const act = (label, icon, action, tag) => ({ label, icon, action, tag });

  const nav = isTeacher ? [
    { label: 'Overview',        icon: LayoutDashboard, action: () => navigate('/teacher'),               tag: 'navigate' },
    { label: 'New Sheet',       icon: PlusSquare,      action: () => navigate('/teacher/create-sheet'),   tag: 'navigate' },
    { label: 'Students',        icon: Users,           action: () => navigate('/teacher/students'),        tag: 'navigate' },
    { label: 'Leaderboard',     icon: Trophy,          action: () => navigate('/teacher/leaderboard'),     tag: 'navigate' },
  ] : [
    { label: 'Dashboard',       icon: LayoutDashboard, action: () => navigate('/student'),               tag: 'navigate' },
    { label: 'My Sheets',       icon: BookOpen,        action: () => navigate('/student/sheets'),         tag: 'navigate' },
    { label: 'Progress',        icon: TrendingUp,      action: () => navigate('/student/progress'),       tag: 'navigate' },
    { label: 'Leaderboard',     icon: Trophy,          action: () => navigate('/student/leaderboard'),    tag: 'navigate' },
  ];

  const actions = [
    {
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon:  theme === 'dark' ? Sun : Moon,
      action: toggleTheme,
      tag: 'theme',
    },
    ...(!isTeacher ? [{
      label:  'Sync LeetCode',
      icon:   RefreshCw,
      action: sync,
      tag:    'sync',
    }] : []),
    {
      label:  'Sign Out',
      icon:   LogOut,
      action: () => { logout(); navigate('/login'); },
      tag:    'account',
    },
  ];

  return [...nav, ...actions];
};

// ─── Tag badge ────────────────────────────────────────────────────────────────
const tagColors = {
  navigate: { bg: 'rgba(74,222,128,0.1)',  text: 'var(--easy)'   },
  theme:    { bg: 'rgba(251,191,36,0.1)',  text: 'var(--medium)' },
  sync:     { bg: 'rgba(74,222,128,0.1)',  text: 'var(--accent)' },
  account:  { bg: 'rgba(248,113,113,0.1)', text: 'var(--hard)'   },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CommandPalette() {
  const { open, closePalette } = useCommandStore();
  const { logout, user, isTeacher } = useAuthStore();
  const { theme, toggleTheme }      = useThemeStore();
  const navigate = useNavigate();

  const [query,   setQuery]   = useState('');
  const [cursor,  setCursor]  = useState(0);
  const [syncing, setSyncing] = useState(false);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const sync = async () => {
    closePalette();
    setSyncing(true);
    try {
      const res = await leetcodeAPI.sync();
      toast.success(`Synced! ${res.data.leetcode.totalSolved} solved 🎉`);
      window.dispatchEvent(new CustomEvent('leetcode-synced', { detail: res.data.leetcode }));
    } catch (err) {
      toast.error(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const commands = useMemo(() =>
    buildCommands({ isTeacher: isTeacher(), theme, toggleTheme, logout, navigate, sync, setSyncing }),
    [isTeacher, theme]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [commands, query]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ⌘K / Ctrl+K global
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closePalette() : useCommandStore.getState().openPalette();
      }
      if (e.key === 'Escape') closePalette();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Arrow nav + Enter
  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => (c + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => (c - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[cursor]) {
      filtered[cursor].action();
      closePalette();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  // Reset cursor on query change
  useEffect(() => setCursor(0), [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={closePalette}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.95, y: -20  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl"
            style={{
              background:  'var(--surface)',
              border:      '1px solid var(--border-2)',
              boxShadow:   '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(74,222,128,0.08)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search commands..."
                className="flex-1 bg-transparent outline-none text-sm font-code"
                style={{ color: 'var(--text-primary)' }}
              />
              <kbd className="flex items-center gap-0.5 text-xs font-code px-1.5 py-0.5 rounded"
                   style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}>
                <Command size={9} /> K
              </kbd>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5"
                 style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                {user?.name} · <span style={{ color: 'var(--accent)' }}>{user?.role}</span>
              </span>
              <span className="ml-auto text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                ↑↓ to navigate · ↵ to select
              </span>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm font-code"
                     style={{ color: 'var(--text-muted)' }}>
                  No commands found for "{query}"
                </div>
              ) : (
                filtered.map(({ label, icon: Icon, action, tag }, i) => {
                  const tc = tagColors[tag] ?? tagColors.navigate;
                  return (
                    <motion.button
                      key={label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => { action(); closePalette(); }}
                      onMouseEnter={() => setCursor(i)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                      style={{
                        background: cursor === i ? 'var(--bg-2)' : 'transparent',
                        borderLeft: cursor === i ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: cursor === i ? 'var(--accent-glow)' : 'var(--border)', border: cursor === i ? '1px solid rgba(74,222,128,0.3)' : 'none' }}>
                        {Icon && <Icon size={13} style={{ color: cursor === i ? 'var(--accent)' : 'var(--text-muted)' }} />}
                      </div>

                      <span className="flex-1 text-sm font-medium" style={{ color: cursor === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {label}
                      </span>

                      <span className="text-xs font-code px-2 py-0.5 rounded-full capitalize"
                            style={{ background: tc.bg, color: tc.text }}>
                        {tag}
                      </span>

                      {cursor === i && (
                        <ArrowRight size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5"
                 style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
              <div className="flex items-center gap-1.5">
                <Zap size={10} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                  DSA<span style={{ color: 'var(--accent)' }}>&amp;Chill</span> command center
                </span>
              </div>
              <button
                onClick={closePalette}
                className="text-xs font-code px-2 py-0.5 rounded"
                style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
              >
                esc
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}