import { cn } from '@/lib/utils';

const config = {
  Easy:   { dot: 'var(--easy)',   bg: 'var(--easy-bg)',   text: 'var(--easy)' },
  Medium: { dot: 'var(--medium)', bg: 'var(--medium-bg)', text: 'var(--medium)' },
  Hard:   { dot: 'var(--hard)',   bg: 'var(--hard-bg)',   text: 'var(--hard)' },
};

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  const { dot, bg, text } = config[difficulty] ?? config.Easy;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold font-code',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}
      style={{ background: bg, color: text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {difficulty}
    </span>
  );
}