import { useLocation }    from 'react-router-dom';
import { motion }         from 'framer-motion';
import { RefreshCw, Search, Menu } from 'lucide-react';
import { useState }       from 'react';
import { leetcodeAPI }    from '@/api';
import toast              from 'react-hot-toast';
import useAuthStore       from '@/store/authStore';
import useCommandStore    from '@/store/commandStore';
import ThemeToggle        from '@/components/layout/ThemeToggle';

const pageTitles = {
  '/student':               ['Dashboard',    'Your LeetCode progress at a glance'],
  '/student/sheets':        ['My Sheets',    'Class sheets & personal practice lists'],
  '/student/progress':      ['Progress',     'Deep-dive into your solving history'],
  '/student/leaderboard':   ['Leaderboard',  'See how you rank in your class'],
  '/teacher':               ['Overview',     'Class performance & analytics'],
  '/teacher/create-sheet':  ['New Sheet',    'Build a custom problem set'],
  '/teacher/students':      ['Students',     'Manage your class roster'],
  '/teacher/leaderboard':   ['Leaderboard',  'Class rankings & tier breakdown'],
};

export default function Navbar({ onMenuClick = () => {} }) {
  const { pathname }    = useLocation();
  const { user }        = useAuthStore();
  const { openPalette } = useCommandStore();
  const [syncing, setSyncing] = useState(false);

  const [title, subtitle] = pageTitles[pathname] ?? ['DSA&Chill', ''];
  const isStudentDash = pathname === '/student';

  const handleSync = async () => {
    if (!user?.leetcodeUsername) {
      toast.error('Set your LeetCode username in profile first!');
      return;
    }
    setSyncing(true);
    try {
      const res = await leetcodeAPI.sync();
      toast.success(`Synced! ${res.data.leetcode.totalSolved} problems solved 🎉`);
      window.dispatchEvent(
        new CustomEvent('leetcode-synced', { detail: res.data.leetcode })
      );
    } catch (err) {
      toast.error(err.message || 'Sync failed. Try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 h-16 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Left — mobile menu + page title */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <Menu size={16} style={{ color: 'var(--text-secondary)' }} />
        </motion.button>

        <div className="min-w-0">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display font-bold text-base md:text-lg leading-none truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className="text-xs mt-0.5 hidden sm:block truncate"
               style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* ⌘K command palette */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openPalette}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{
            background: 'var(--bg-2)',
            border:     '1px solid var(--border)',
            color:      'var(--text-muted)',
          }}
        >
          <Search size={14} />
          <span className="hidden md:inline font-code text-xs">Search...</span>
          <kbd
            className="hidden md:inline text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}
          >
            ⌘K
          </kbd>
        </motion.button>


        {/* Theme toggle — replaces bell icon */}
        <ThemeToggle />
      </div>
    </header>
  );
}