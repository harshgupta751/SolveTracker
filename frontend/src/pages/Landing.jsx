import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { ArrowRight, Zap, Brain, BarChart3, Users, Code2, RefreshCw } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import useThemeStore from '@/store/themeStore';

const FEATURES = [
  { icon: RefreshCw, title: 'Auto LeetCode Sync', desc: 'Pull solved counts, topics, and recent submissions in one click via the unofficial GraphQL API.' },
  { icon: Brain,     title: 'AI Insights',        desc: 'Claude analyzes your weak topics and generates personalized study suggestions.' },
  { icon: BarChart3, title: 'Rich Analytics',     desc: 'Recharts-powered dashboards show streak calendars, topic heatmaps, and difficulty splits.' },
  { icon: Users,     title: 'Class Management',   desc: 'Teachers create problem sheets, track student progress, and view class-wide topic stats.' },
  { icon: Code2,     title: 'Custom Sheets',      desc: 'Build curated problem lists with Easy/Medium/Hard tags, notes, and LeetCode links.' },
  { icon: Zap,       title: 'Real-time Progress', desc: 'Students mark problems done. Progress syncs to the teacher dashboard instantly.' },
];

const CODE_SNIPPET = `// DSA&Chill — auto-sync your LeetCode
const stats = await fetchLeetCodeStats('username');
// → { totalSolved: 342, easySolved: 120,
//     mediumSolved: 180, hardSolved: 42,
//     topicStats: { "Arrays": 45, "DP": 32 },
//     recentSubmissions: [...] }`;

const STATS = [
  { value: '500+', label: 'Problems Tracked' },
  { value: '50+',  label: 'DSA Topics' },
  { value: '98%',  label: 'Sync Accuracy' },
  { value: '∞',    label: 'Motivation' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
           style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <Zap size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            DSA<span style={{ color: 'var(--accent)' }}>&amp;Chill</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <ThemeToggle />
          <button onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--accent)', color: '#0a0a0f', boxShadow: '0 0 20px var(--accent-glow)' }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24"
               style={{ backgroundImage: theme === 'dark' ? 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(30 30 46 / 0.6)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(226 232 240 / 0.7)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")' }}>

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)' }} />

        <motion.div style={{ y }} className="relative z-10 max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-code font-medium mb-6"
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)' }}
          >
            <Zap size={11} />
            AI-Powered DSA Learning System
            <Zap size={11} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
            className="font-display font-black text-5xl md:text-7xl leading-none tracking-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Master DSA,{' '}
            <span style={{
              color: 'transparent',
              WebkitTextStroke: `1px var(--accent)`,
              textShadow: '0 0 30px var(--accent-glow)',
            }}>
              Actually Chill
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sync your LeetCode stats automatically, get AI-generated study insights, and let your instructor track your progress — all in one sleek dashboard.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(74,222,128,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold text-base transition-all"
              style={{ background: 'var(--accent)', color: '#0a0a0f', boxShadow: '0 0 20px rgba(74,222,128,0.25)' }}
            >
              Start for Free <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-semibold text-base transition-all"
              style={{ border: '1px solid var(--border-2)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
            >
              Sign In →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Code preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 60 }}
          className="relative z-10 mt-16 w-full max-w-2xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden shadow-card-dark"
               style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex gap-1.5">
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-code ml-2" style={{ color: 'var(--text-muted)' }}>
                leetcode.js — DSA&amp;Chill
              </span>
            </div>
            <pre className="text-left p-5 text-sm font-code overflow-x-auto leading-relaxed"
                 style={{ color: 'var(--accent)', background: 'transparent' }}>
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Stats band */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display font-black text-4xl mb-1" style={{ color: 'var(--accent)' }}>{value}</div>
              <div className="text-sm font-code" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-black text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything in one place
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Built for students who want to grind smart, not just hard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(74,222,128,0.10)' }}
              className="card p-6 cursor-default group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                   style={{ background: 'var(--accent-glow)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <Icon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-24 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display font-black text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to{' '}
            <span style={{ color: 'var(--accent)' }}>chill</span> while you grind?
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Join your class. Sync LeetCode. Let the AI do the coaching.
          </p>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(74,222,128,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-xl font-display font-bold text-lg"
            style={{ background: 'var(--accent)', color: '#0a0a0f' }}
          >
            Create Free Account →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
          DSA&amp;Chill © {currentYear} — Built with ⚡ for the grind
        </span>
      </footer>
    </div>
  );
}