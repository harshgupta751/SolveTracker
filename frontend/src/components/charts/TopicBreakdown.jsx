import { useMemo } from 'react';
import { motion }  from 'framer-motion';

export default function TopicBreakdown({ topicStats = {} }) {
  const data = useMemo(() =>
    Object.entries(topicStats)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    [topicStats]
  );

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
          No topic data — sync LeetCode to load
        </p>
      </div>
    );
  }

  const maxCount  = data[0]?.count || 1;
  const barWidth  = 52;
  const chartW    = Math.max(480, data.length * (barWidth + 8) + 48);

  return (
    <div>
      {/* Stats row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          {data.length} topics covered
        </span>
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
          scroll →
        </span>
      </div>

      {/* Scrollable chart */}
      <div
        className="overflow-x-auto pb-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-2) transparent',
        }}
      >
        <div
          className="flex items-end gap-2"
          style={{ width: chartW, height: 200, paddingBottom: 28, position: 'relative' }}
        >
          {data.map(({ topic, count }, i) => {
            const barH   = Math.max(8, Math.round((count / maxCount) * 150));
            const isTop3 = i < 3;

            return (
              <div
                key={topic}
                className="flex flex-col items-center group"
                style={{ width: barWidth, flexShrink: 0 }}
                title={`${topic}: ${count} solved`}
              >
                {/* Count label */}
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="font-display font-black text-xs mb-1"
                  style={{ color: isTop3 ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {count}
                </motion.span>

                {/* Bar */}
                <div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{ height: barH, background: 'var(--border)' }}
                >
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                    style={{
                      background: isTop3
                        ? 'var(--accent)'
                        : `rgba(74,222,128,${Math.max(0.18, 0.65 - i * 0.04)})`,
                      boxShadow: isTop3 ? '0 -2px 8px rgba(74,222,128,0.3)' : 'none',
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
                  />
                </div>

                {/* Topic label */}
                <div
                  className="mt-1.5 text-center"
                  style={{
                    width:      barWidth,
                    overflow:   'hidden',
                    position:   'absolute',
                    bottom:     0,
                    transform:  'none',
                  }}
                >
                  <span
                    className="font-code"
                    style={{
                      fontSize:    9,
                      color:       isTop3 ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight:  isTop3 ? 600 : 400,
                      display:     'block',
                      overflow:    'hidden',
                      textOverflow:'ellipsis',
                      whiteSpace:  'nowrap',
                      lineHeight:  1.3,
                    }}
                    title={topic}
                  >
                    {topic}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top topics summary chips */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {data.slice(0, 6).map(({ topic, count }, i) => (
          <span
            key={topic}
            className="text-xs font-code px-2 py-0.5 rounded-full"
            style={{
              background: i === 0 ? 'var(--accent-glow)' : 'var(--bg-2)',
              border:     i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
              color:      i === 0 ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {topic} · {count}
          </span>
        ))}
        {data.length > 6 && (
          <span className="text-xs font-code px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            +{data.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}