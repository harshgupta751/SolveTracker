import { motion } from 'framer-motion';
import { useMemo } from 'react';

const BUCKETS = [
  { label: '0',    min: 0,  max: 0,   bg: 'var(--border)',                        text: 'var(--text-muted)'     },
  { label: '1–5',  min: 1,  max: 5,   bg: 'rgba(74,222,128,0.15)',                text: 'var(--easy)'           },
  { label: '6–15', min: 6,  max: 15,  bg: 'rgba(74,222,128,0.35)',                text: 'var(--easy)'           },
  { label: '16+',  min: 16, max: Infinity, bg: 'rgba(74,222,128,0.70)',           text: '#0a0a0f'               },
];

const getBucket = (val) => BUCKETS.find(b => val >= b.min && val <= b.max) ?? BUCKETS[0];

export default function ClassHeatmap({ topicData = [] }) {
  const top20 = useMemo(() =>
    [...topicData].sort((a, b) => b.total - a.total).slice(0, 20),
    [topicData]
  );

  if (!top20.length) {
    return (
      <div className="flex items-center justify-center h-40 text-sm font-code"
           style={{ color: 'var(--text-muted)' }}>
        No topic data yet. Students must sync LeetCode first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 justify-end flex-wrap">
        {BUCKETS.map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded" style={{ background: b.bg, border: '1px solid var(--border)' }} />
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{b.label}</span>
          </div>
        ))}
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>avg solved/student</span>
      </div>

      {/* Grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {top20.map(({ topic, avg }, i) => {
          const bucket = getBucket(Math.round(avg));
          return (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 160 }}
              whileHover={{ scale: 1.04, zIndex: 10 }}
              className="relative p-3 rounded-xl cursor-default"
              style={{
                background: bucket.bg,
                border: '1px solid rgba(74,222,128,0.12)',
              }}
              title={`${topic}: avg ${avg} solved`}
            >
              <p className="text-xs font-semibold truncate" style={{ color: bucket.text }}>
                {topic}
              </p>
              <p className="font-display font-black text-xl mt-0.5" style={{ color: bucket.text }}>
                {avg}
              </p>
              <p className="text-xs opacity-70" style={{ color: bucket.text }}>avg</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}