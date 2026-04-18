import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-sm font-code"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value} solved</p>
    </div>
  );
};

export default function ProgressLine({ recentSubmissions = [] }) {
  // Aggregate subs by date into a cumulative timeline
  const data = useMemo(() => {
    if (!recentSubmissions.length) return [];
    const byDate = {};
    recentSubmissions.forEach(({ timestamp }) => {
      const d = new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDate[d] = (byDate[d] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));
  }, [recentSubmissions]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-sm font-code"
           style={{ color: 'var(--text-muted)' }}>
        Sync LeetCode to see submission trend
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false} allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone" dataKey="count"
          stroke="var(--accent)" strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}