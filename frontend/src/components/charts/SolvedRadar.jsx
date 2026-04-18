import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-sm font-code"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p>{payload[0].payload.name}: <strong>{payload[0].value}</strong></p>
    </div>
  );
};

export default function SolvedRadial({ easy = 0, medium = 0, hard = 0 }) {
  const total = easy + medium + hard;

  const data = [
    { name: 'Hard',   value: hard,   fill: 'var(--hard)' },
    { name: 'Medium', value: medium, fill: 'var(--medium)' },
    { name: 'Easy',   value: easy,   fill: 'var(--easy)' },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="30%" outerRadius="90%"
          data={data}
          startAngle={90} endAngle={-270}
          barSize={14}
        >
          <RadialBar
            minAngle={4}
            background={{ fill: 'var(--border)' }}
            dataKey="value"
            cornerRadius={8}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center stat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
          {total}
        </span>
        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>solved</span>
      </motion.div>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {[['Easy', 'easy'], ['Medium', 'medium'], ['Hard', 'hard']].map(([label, key]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--${key})` }} />
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}