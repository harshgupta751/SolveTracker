import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-sm font-code"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  );
};

export default function DifficultyDonut({ easy = 0, medium = 0, hard = 0, size = 160 }) {
  const data = [
    { name: 'Easy',   value: easy   || 0, color: 'var(--easy)'   },
    { name: 'Medium', value: medium || 0, color: 'var(--medium)' },
    { name: 'Hard',   value: hard   || 0, color: 'var(--hard)'   },
  ].filter(d => d.value > 0);

  const total = easy + medium + hard;

  if (!total) return (
    <div className="flex items-center justify-center rounded-full"
         style={{ width: size, height: size, border: '3px solid var(--border)' }}>
      <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>no data</span>
    </div>
  );

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius="60%" outerRadius="85%"
            dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-black text-xl leading-none" style={{ color: 'var(--text-primary)' }}>
          {total}
        </span>
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>solved</span>
      </div>
    </div>
  );
}