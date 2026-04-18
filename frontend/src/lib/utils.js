import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatNumber = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  : String(n ?? 0);

export const formatDate = (ts) => {
  if (!ts) return 'N/A';
  return new Date(typeof ts === 'number' ? ts * 1000 : ts)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const relativeTime = (ts) => {
  const now = Date.now();
  const then = typeof ts === 'number' && ts < 2e10 ? ts * 1000 : ts;
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const getDifficultyColor = (difficulty) => {
  const map = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
  return map[difficulty] || 'easy';
};

export const getLangIcon = (lang) => {
  const map = { python: 'Py', python3: 'Py', java: 'Jv', cpp: 'C++', 'c++': 'C++', javascript: 'JS', typescript: 'TS', go: 'Go', rust: 'Rs', ruby: 'Rb' };
  return map[lang?.toLowerCase()] || lang?.slice(0, 3).toUpperCase() || '?';
};