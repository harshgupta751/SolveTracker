import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useThemeStore from '@/store/themeStore';

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-sm font-code"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <strong style={{ color: 'var(--accent)' }}>{payload[0].value} solved</strong>
    </div>
  );
};

export default function TopicBreakdown({ topicStats = {} }) {
  const { theme } = useThemeStore();

  const data = Object.entries(topicStats)
    .map(([topic, count]) => ({ topic: topic.length > 12 ? topic.slice(0, 12) + '…' : topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
          No topic data — sync LeetCode to load
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="topic"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74,222,128,0.05)', radius: 4 }} />
        <Bar dataKey="count" shape={<CustomBar />} maxBarSize={32}>
          {data.map((_, idx) => (
            <Cell
              key={idx}
              fill={idx === 0 ? 'var(--accent)' : theme === 'dark' ? '#1e2d2e' : '#d1fae5'}
              opacity={1 - idx * 0.07}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}