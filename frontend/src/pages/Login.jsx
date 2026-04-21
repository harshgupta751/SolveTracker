import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/layout/ThemeToggle';
import GoogleButton from '@/components/auth/GoogleButton';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

    const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleChange = (e) => {
    clearError();
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      toast.success('Welcome back! 🎉');
      navigate(`/${res.role}`);
    } else {
      toast.error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left decorative panel ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{
          background:   'var(--surface)',
          borderRight:  '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:  'var(--accent-glow)',
              border:      '1px solid var(--accent)',
            }}
          >
            <Zap size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            className="font-display font-bold text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            DSA<span style={{ color: 'var(--accent)' }}>&amp;Chill</span>
          </span>
        </Link>

        {/* Middle content */}
        <div className="space-y-8">
          {/* Fake terminal card */}
          <div
            className="font-code text-sm space-y-2 p-6 rounded-xl"
            style={{
              background: 'var(--bg-2)',
              border:     '1px solid var(--border)',
              color:      'var(--accent)',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>// Your progress today</span>
            </div>
            <div>
              totalSolved:{' '}
              <span style={{ color: 'var(--medium)' }}>342</span>,
            </div>
            <div>
              streak:{' '}
              <span style={{ color: 'var(--medium)' }}>7</span> days 🔥,
            </div>
            <div>
              todayTarget:{' '}
              <span style={{ color: 'var(--easy)' }}>"2 mediums"</span>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h2
              className="font-display font-black text-3xl mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Track. Sync. Improve.
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Your LeetCode grind deserves a proper dashboard. Sign in to see
              your stats, problem sheets, and AI-powered study insights.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
          DSA&amp;Chill © {currentYear}
        </div>
      </motion.div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">

        {/* Theme toggle — top right */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-sm"
        >
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="font-display font-black text-3xl mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Sign in
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                Register →
              </Link>
            </p>
          </div>

          {/* ── Google OAuth button ── */}
          <GoogleButton role="student" />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: '1px solid var(--border)' }}
              />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs"
                style={{
                  background: 'var(--bg)',
                  color:      'var(--text-muted)',
                }}
              >
                or sign in with email
              </span>
            </div>
          </div>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0,  height: 'auto' }}
                exit={{    opacity: 0, y: -8, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--hard-bg)',
                  border:     '1px solid var(--hard)',
                  color:      'var(--hard)',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Email / Password form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-display font-bold text-sm mt-2 transition-all disabled:opacity-60"
              style={{
                background: 'var(--accent)',
                color:      '#0a0a0f',
                boxShadow:  '0 0 24px var(--accent-glow)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}