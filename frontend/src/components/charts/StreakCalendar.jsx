import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { relativeTime } from '@/lib/utils';

export default function StreakCalendar({ recentSubmissions = [] }) {
  // Build a map of date → count from recent submissions
  const heatmap = useMemo(() => {
    const map = {};
    recentSubmissions.forEach(({ timestamp }) => {
      const date = new Date(timestamp * 1000).toDateString();
      map[date] = (map[date] || 0) + 1;
    });
    return map;
  }, [recentSubmissions]);

  // Last 35 days grid (5 rows × 7 cols)
  const cells = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (34 - i));
      const key = d.toDateString();
      return { date: key, count: heatmap[key] || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });
  }, [heatmap]);

  const getColor = (count) => {
    if (count === 0) return 'var(--border)';
    if (count === 1) return 'rgba(74,222,128,0.3)';
    if (count <= 3)  return 'rgba(74,222,128,0.55)';
    return 'var(--accent)';
  };

  const streak = useMemo(() => {
    let s = 0;
    const today = new Date().toDateString();
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].count > 0) s++;
      else break;
    }
    return s;
  }, [cells]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Last 35 days</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
            {streak} day streak
          </span>
        </div>
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(({ date, count, label }, i) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01, type: 'spring', stiffness: 200 }}
            title={`${label}: ${count} solved`}
            className="aspect-square rounded cursor-default"
            style={{
              background: getColor(count),
              boxShadow:  count > 0 ? '0 0 6px rgba(74,222,128,0.15)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Recent activity list */}
      {recentSubmissions.length > 0 && (
        <div className="space-y-1.5 mt-3">
          {recentSubmissions.slice(0, 5).map((s, i) => (
            <motion.div
              key={s.titleSlug + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg"
              style={{ background: 'var(--bg-2)' }}
            >
              <span className="text-xs truncate max-w-[55%]" style={{ color: 'var(--text-primary)' }}>
                {s.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-code text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}>
                  {s.lang?.slice(0, 4)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {relativeTime(s.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}