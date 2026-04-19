import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { leetcodeAPI } from '@/api';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useCommandStore from '@/store/commandStore';

const pageTitles = {
  '/student':              ['Dashboard',  'Your LeetCode progress at a glance'],
  '/student/sheets':       ['My Sheets',  'Problem sets from your instructor'],
  '/student/progress':     ['Progress',   'Deep-dive into your solving history'],
  '/student/leaderboard':  ['Leaderboard','See how you rank in your class'],
  '/teacher':              ['Overview',   'Class performance & analytics'],
  '/teacher/create-sheet': ['New Sheet',  'Build a custom problem set'],
  '/teacher/leaderboard':  ['Leaderboard','Class rankings & tier breakdown'],
};

export default function Navbar({ onMenuClick = () => {} }) {
  const { pathname } = useLocation();
  const { user }     = useAuthStore();
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
      className="flex items-center justify-between px-6 h-16 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Page title */}
      <div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-display font-bold text-lg leading-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Mobile menu button — visible only below md breakpoint */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <Menu size={16} style={{ color: 'var(--text-secondary)' }} />
        </motion.button>

        {/* Command palette trigger */}
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
          <span className="hidden sm:inline font-code text-xs">
            Search commands...
          </span>
          <kbd
            className="hidden sm:inline text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--border)',
              color:      'var(--text-muted)',
              fontSize:   '10px',
            }}
          >
            ⌘K
          </kbd>
        </motion.button>

        {/* Sync button — only on student dashboard */}
        {isStudentDash && (
          <motion.button
            onClick={handleSync}
            disabled={syncing}
            whileHover={{ scale: syncing ? 1 : 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{
              background: 'var(--accent-glow)',
              border:     '1px solid var(--accent)',
              color:      'var(--accent)',
              boxShadow:  syncing ? '0 0 16px rgba(74,222,128,0.2)' : 'none',
            }}
          >
            <motion.div
              animate={{ rotate: syncing ? 360 : 0 }}
              transition={{
                duration: 1,
                repeat:   syncing ? Infinity : 0,
                ease:     'linear',
              }}
            >
              <RefreshCw size={14} />
            </motion.div>
            {syncing ? 'Syncing...' : 'Sync LC'}
          </motion.button>
        )}

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: 'var(--hard)' }}
          />
        </motion.button>

      </div>
    </header>
  );
}