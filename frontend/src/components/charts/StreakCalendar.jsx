import { useMemo }      from 'react';
import { motion }       from 'framer-motion';
import { Flame, Zap }   from 'lucide-react';
import { relativeTime } from '@/lib/utils';

const WEEKS        = 18;
const TOTAL_DAYS   = WEEKS * 7;
const MONTH_NAMES  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS   = ['Mon','','Wed','','Fri','',''];  // only label M W F

const getColor = (count) => {
  if (count === 0) return 'var(--border)';
  if (count === 1) return 'rgba(74,222,128,0.22)';
  if (count === 2) return 'rgba(74,222,128,0.42)';
  if (count <= 4)  return 'rgba(74,222,128,0.65)';
  return 'var(--accent)';
};

const getShadow = (count) => {
  if (count <= 2) return 'none';
  if (count <= 4) return '0 0 4px rgba(74,222,128,0.25)';
  return '0 0 8px rgba(74,222,128,0.45)';
};

export default function StreakCalendar({ recentSubmissions = [] }) {
  const heatmap = useMemo(() => {
    const map = {};
    recentSubmissions.forEach(({ timestamp }) => {
      const d   = new Date(timestamp * 1000);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key]  = (map[key] || 0) + 1;
    });
    return map;
  }, [recentSubmissions]);

  // Build weeks array aligned to Monday
  const { grid, monthMarkers } = useMemo(() => {
    const today    = new Date();
    const start    = new Date(today);
    start.setDate(today.getDate() - TOTAL_DAYS + 1);

    // Walk back to Monday
    const dow = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - ((dow + 6) % 7));

    const weeks     = [];
    const markers   = [];
    const cur       = new Date(start);
    let lastMonth   = -1;

    for (let w = 0; w < WEEKS + 2; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key   = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
        const count = heatmap[key] || 0;
        week.push({ date: new Date(cur), key, count,
          label: cur.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) });
        if (d === 0 && cur.getMonth() !== lastMonth) {
          markers.push({ weekIdx: w, label: MONTH_NAMES[cur.getMonth()] });
          lastMonth = cur.getMonth();
        }
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return { grid: weeks, monthMarkers: markers };
  }, [heatmap]);

  // Current streak
  const streak = useMemo(() => {
    let s = 0;
    const today = new Date();
    for (let d = 0; d < 90; d++) {
      const check = new Date(today);
      check.setDate(today.getDate() - d);
      const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
      if (heatmap[key] > 0) s++;
      else if (d > 0) break;
    }
    return s;
  }, [heatmap]);

  const totalRecent = recentSubmissions.length;
  const CELL = 12;
  const GAP  = 3;

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Flame size={14} style={{ color: streak > 0 ? '#f59e0b' : 'var(--text-muted)' }} />
          <span
            className="font-display font-bold text-sm"
            style={{ color: streak > 0 ? '#f59e0b' : 'var(--text-muted)' }}
          >
            {streak > 0 ? `${streak}-day streak` : 'No streak yet'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={11} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
            {totalRecent} recent submissions
          </span>
        </div>
      </div>

      {/* Heatmap — horizontally scrollable */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0 }}>

          {/* Month labels */}
          <div style={{ display: 'flex', paddingLeft: 28, marginBottom: 4 }}>
            {grid.map((_, wi) => {
              const marker = monthMarkers.find(m => m.weekIdx === wi);
              return (
                <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}>
                  {marker && (
                    <span style={{ fontSize: 9, color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                      {marker.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid with day labels */}
          <div style={{ display: 'flex', gap: 0 }}>
            {/* Day labels column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 5, width: 24 }}>
              {DAY_LABELS.map((label, i) => (
                <div key={i} style={{ height: CELL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 8, color: 'var(--text-muted)',
                    fontFamily: 'JetBrains Mono, monospace' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: GAP, flexShrink: 0 }}>
                {week.map((day) => (
                  <motion.div
                    key={day.key}
                    title={`${day.label}: ${day.count} solved`}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: wi * 0.01 }}
                    style={{
                      width:        CELL,
                      height:       CELL,
                      borderRadius: 3,
                      background:   getColor(day.count),
                      boxShadow:    getShadow(day.count),
                      cursor:       'default',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Less</span>
            {[0, 1, 2, 3, 5].map((n, i) => (
              <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, background: getColor(n) }} />
            ))}
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>More</span>
          </div>
        </div>
      </div>

      {/* Recent accepted list */}
      {recentSubmissions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-code font-medium" style={{ color: 'var(--text-muted)' }}>
            Recent accepted
          </p>
          {recentSubmissions.slice(0, 5).map((s, i) => (
            <motion.div
              key={s.titleSlug + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-xs truncate max-w-[55%]" style={{ color: 'var(--text-primary)' }}>
                {s.title}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="font-code text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 10 }}
                >
                  {s.lang?.slice(0, 4)}
                </span>
                <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
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