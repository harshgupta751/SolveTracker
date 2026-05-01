import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, ScatterChart, Scatter, ZAxis,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tipStyle = {
  background:   'var(--surface)',
  border:       '1px solid var(--border)',
  borderRadius: 10,
  fontFamily:   'JetBrains Mono, monospace',
  fontSize:     11,
  color:        'var(--text-primary)',
};

// ─── 1. Difficulty Distribution across class ──────────────────────────────────
export function ClassDifficultyChart({ classData }) {
  const data = useMemo(() => {
    const synced = classData.filter(d => d.leetcode?.lastSynced);
    if (!synced.length) return [];

    // Bucket students by tier
    const avgSolved = synced.reduce((s, d) => s + (d.leetcode?.totalSolved ?? 0), 0) / synced.length;
    const tiers = [
      { name: 'Gallant 🏆', students: synced.filter(d => (d.leetcode?.totalSolved ?? 0) >= avgSolved * 1.35) },
      { name: 'Average 📈',  students: synced.filter(d => {
          const t = d.leetcode?.totalSolved ?? 0;
          return t >= avgSolved * 0.65 && t < avgSolved * 1.35;
        })
      },
      { name: 'Gradual 🌱', students: synced.filter(d => (d.leetcode?.totalSolved ?? 0) < avgSolved * 0.65) },
    ];

    return tiers.map(({ name, students }) => ({
      name,
      Easy:   students.length
        ? Math.round(students.reduce((s, d) => s + (d.leetcode?.easySolved ?? 0), 0) / students.length)
        : 0,
      Medium: students.length
        ? Math.round(students.reduce((s, d) => s + (d.leetcode?.mediumSolved ?? 0), 0) / students.length)
        : 0,
      Hard:   students.length
        ? Math.round(students.reduce((s, d) => s + (d.leetcode?.hardSolved ?? 0), 0) / students.length)
        : 0,
    }));
  }, [classData]);

  if (!data.length) return <EmptyChart msg="Sync students to see difficulty breakdown" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', paddingTop: 8 }} />
        <Bar dataKey="Easy"   fill="var(--easy)"   radius={[4,4,0,0]} maxBarSize={28} />
        <Bar dataKey="Medium" fill="var(--medium)" radius={[4,4,0,0]} maxBarSize={28} />
        <Bar dataKey="Hard"   fill="var(--hard)"   radius={[4,4,0,0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 2. Acceptance rate distribution histogram ────────────────────────────────
export function AcceptanceDistChart({ classData }) {
  const data = useMemo(() => {
    const buckets = [
      { name: '0–30%',  min: 0,  max: 30,  count: 0 },
      { name: '31–45%', min: 31, max: 45,  count: 0 },
      { name: '46–55%', min: 46, max: 55,  count: 0 },
      { name: '56–65%', min: 56, max: 65,  count: 0 },
      { name: '66–75%', min: 66, max: 75,  count: 0 },
      { name: '76%+',   min: 76, max: 100, count: 0 },
    ];
    classData.forEach(d => {
      const acc = d.leetcode?.acceptanceRate ?? 0;
      const b   = buckets.find(b => acc >= b.min && acc <= b.max);
      if (b) b.count++;
    });
    return buckets;
  }, [classData]);

  const getColor = (name) => {
    if (name === '76%+')   return 'var(--easy)';
    if (name === '66–75%') return 'rgba(74,222,128,0.6)';
    if (name === '56–65%') return 'var(--medium)';
    if (name === '46–55%') return 'rgba(251,191,36,0.6)';
    return 'var(--hard)';
  };

  if (!data.some(d => d.count > 0)) return <EmptyChart msg="No acceptance data yet" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                 formatter={(v) => [`${v} students`, 'Count']} />
        <Bar dataKey="count" radius={[4,4,0,0]} maxBarSize={36}>
          {data.map((d, i) => (
            <Cell key={i} fill={getColor(d.name)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 3. Class topic radar ─────────────────────────────────────────────────────
export function ClassTopicRadar({ topicData }) {
  const data = useMemo(() =>
    [...topicData]
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 7)
      .map(t => ({
        topic:    t.topic.length > 11 ? t.topic.slice(0, 11) + '…' : t.topic,
        avg:      t.avg,
        fullMark: topicData[0]?.avg || 1,
      })),
    [topicData]
  );

  if (data.length < 3) return <EmptyChart msg="Need 3+ topics to show radar" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="topic"
          tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }} />
        <Radar name="Class Avg" dataKey="avg"
               stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15}
               strokeWidth={2}
               dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} />
        <Tooltip contentStyle={tipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── 4. Solved distribution — students vs count ───────────────────────────────
export function SolvedDistChart({ classData }) {
  const data = useMemo(() => {
    const buckets = [
      { name: '0–50',   min: 0,   max: 50  },
      { name: '51–100', min: 51,  max: 100 },
      { name: '101–200',min: 101, max: 200 },
      { name: '201–300',min: 201, max: 300 },
      { name: '301–500',min: 301, max: 500 },
      { name: '500+',   min: 501, max: Infinity },
    ].map(b => ({
      ...b,
      students: classData.filter(d => {
        const t = d.leetcode?.totalSolved ?? 0;
        return t >= b.min && t <= b.max;
      }).length,
    }));
    return buckets;
  }, [classData]);

  if (!data.some(d => d.students > 0)) return <EmptyChart msg="No solved data yet" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                 formatter={(v) => [`${v} students`, 'Students']} />
        <Bar dataKey="students" radius={[4,4,0,0]} maxBarSize={36}>
          {data.map((d, i) => (
            <Cell key={i}
              fill={`rgba(74,222,128,${0.25 + i * 0.13})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 5. Weekly class activity (from all students' recent subs) ─────────────────
export function ClassActivityChart({ classData }) {
  const data = useMemo(() => {
    const map = {};
    classData.forEach(({ leetcode }) => {
      (leetcode?.recentSubmissions ?? []).forEach(({ timestamp }) => {
        const d   = new Date(timestamp * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[key]  = (map[key] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date, count }));
  }, [classData]);

  if (!data.length) return <EmptyChart msg="No recent activity data" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="classAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
               axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tipStyle} formatter={(v) => [`${v} submissions`, 'Class']} />
        <Area type="monotone" dataKey="count"
              stroke="var(--accent)" strokeWidth={2}
              fill="url(#classAreaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyChart({ msg }) {
  return (
    <div className="flex items-center justify-center h-44 text-xs font-code"
         style={{ color: 'var(--text-muted)' }}>
      {msg}
    </div>
  );
}