import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/store/themeStore';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className={`
        relative flex items-center justify-center rounded-xl
        border transition-all duration-300 cursor-pointer
        ${compact ? 'w-9 h-9' : 'w-10 h-10'}
      `}
      style={{
        background:   isDark ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.06)',
        borderColor:  isDark ? 'rgba(74,222,128,0.25)' : 'rgba(34,197,94,0.20)',
        boxShadow:    isDark ? '0 0 12px rgba(74,222,128,0.08)' : 'none',
      }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: 90,  opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Sun size={16} style={{ color: '#fbbf24' }} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90,  opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Moon size={16} style={{ color: 'var(--accent)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}