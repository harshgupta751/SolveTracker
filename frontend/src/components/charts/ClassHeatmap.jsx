import { motion }  from 'framer-motion';
import { useMemo } from 'react';

const LEVELS = [
  { min: 0,  max: 0,   bg: 'var(--border)',              text: 'var(--text-muted)',     label: '0'    },
  { min: 1,  max: 5,   bg: 'rgba(74,222,128,0.18)',      text: 'var(--easy)',           label: '1–5'  },
  { min: 6,  max: 15,  bg: 'rgba(74,222,128,0.40)',      text: 'var(--easy)',           label: '6–15' },
  { min: 16, max: 30,  bg: 'rgba(74,222,128,0.65)',      text: '#0a0a0f',               label: '16–30'},
  { min: 31, max: Infinity, bg: 'var(--accent)',         text: '#0a0a0f',               label: '31+'  },
];
const getLevel = (val) => LEVELS.find(l => val >= l.min && val <= l.max) ?? LEVELS[0];

export default function ClassHeatmap({ topicData = [] }) {
  const sorted = useMemo(() =>
    [...topicData].sort((a, b) => b.avg - a.avg),
    [topicData]
  );

  if (!sorted.length) {
    return (
      <div className="flex items-center justify-center h-40 text-sm font-code"
           style={{ color: 'var(--text-muted)' }}>
        No topic data yet. Students must sync LeetCode first.
      </div>
    );
  }

  const maxAvg = sorted[0]?.avg || 1;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          Avg solved per student:
        </span>
        {LEVELS.map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                  style={{ background: l.bg, border: '1px solid var(--border)' }} />
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto"
           style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
        <div className="grid gap-2"
             style={{
               gridTemplateColumns: `repeat(${Math.min(sorted.length, 8)}, minmax(110px, 1fr))`,
               minWidth: Math.min(sorted.length, 8) * 118,
             }}>
          {sorted.map(({ topic, avg, total }, i) => {
            const level   = getLevel(Math.round(avg));
            const barPct  = Math.round((avg / maxAvg) * 100);
            const isTop   = i < 3;

            return (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.025, type: 'spring', stiffness: 160 }}
                whileHover={{ scale: 1.04, zIndex: 10 }}
                className="relative p-3 rounded-xl cursor-default flex flex-col gap-2"
                style={{
                  background: level.bg,
                  border:     isTop ? `1px solid ${level.text === '#0a0a0f' ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.3)'}` : '1px solid rgba(74,222,128,0.10)',
                  boxShadow:  isTop ? '0 0 12px rgba(74,222,128,0.12)' : 'none',
                }}
                title={`${topic}: avg ${avg} solved · ${total} total across class`}
              >
                {/* Rank badge for top 3 */}
                {isTop && (
                  <span
                    className="absolute top-2 right-2 text-xs"
                    style={{ fontSize: 10 }}
                  >
                    {['🥇','🥈','🥉'][i]}
                  </span>
                )}

                <p className="text-xs font-semibold leading-snug pr-4"
                   style={{ color: level.text }}>
                  {topic}
                </p>

                {/* Mini bar */}
                <div className="h-1 rounded-full overflow-hidden"
                     style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: level.text === '#0a0a0f' ? 'rgba(0,0,0,0.35)' : 'rgba(74,222,128,0.7)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.025 }}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display font-black text-xl leading-none"
                       style={{ color: level.text }}>
                      {avg}
                    </p>
                    <p style={{ fontSize: 9, color: level.text, opacity: 0.75, fontFamily: 'JetBrains Mono' }}>
                      avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-code font-semibold text-xs"
                       style={{ color: level.text, opacity: 0.8 }}>
                      {total}
                    </p>
                    <p style={{ fontSize: 9, color: level.text, opacity: 0.6, fontFamily: 'JetBrains Mono' }}>
                      total
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between pt-2"
           style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
            {sorted.length} topics tracked
          </span>
          {sorted[0] && (
            <span className="text-xs font-code" style={{ color: 'var(--easy)' }}>
              Best: {sorted[0].topic} (avg {sorted[0].avg})
            </span>
          )}
          {sorted.at(-1) && sorted.length > 1 && (
            <span className="text-xs font-code" style={{ color: 'var(--medium)' }}>
              Needs work: {sorted.at(-1).topic} (avg {sorted.at(-1).avg})
            </span>
          )}
        </div>
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          scroll →
        </span>
      </div>
    </div>
  );
}