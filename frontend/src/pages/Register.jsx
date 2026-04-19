import GoogleButton from '@/components/auth/GoogleButton';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [show, setShow] = useState(false);

  const handleChange = (e) => { clearError(); setForm(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const res = await register(form);
    if (res.success) {
      toast.success('Account created! Welcome to DSA&Chill 🚀');
      navigate(`/${form.role}`);
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  const inputStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative"
         style={{ background: 'var(--bg)' }}>
      <div className="absolute top-6 right-6"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <Zap size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            DSA<span style={{ color: 'var(--accent)' }}>&amp;Chill</span>
          </span>
        </Link>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="font-display font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Create account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have one?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in →</Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-2)' }}>
            {[['student', GraduationCap, 'Student'], ['teacher', BookOpen, 'Teacher']].map(([r, Icon, label]) => (
              <motion.button
                key={r}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm(p => ({ ...p, role: r }))}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background:  form.role === r ? 'var(--surface)' : 'transparent',
                  color:       form.role === r ? 'var(--accent)' : 'var(--text-muted)',
                  border:      form.role === r ? '1px solid var(--accent)' : '1px solid transparent',
                  boxShadow:   form.role === r ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </motion.button>
            ))}
          </div>

                  <GoogleButton role={form.role} />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs"
                    style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                or register with email
              </span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--hard-bg)', border: '1px solid var(--hard)', color: 'var(--hard)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',  type: 'text',     icon: User, placeholder: 'Your full name'       },
              { name: 'email', type: 'email',     icon: Mail, placeholder: 'you@university.edu'  },
            ].map(({ name, type, icon: Icon, placeholder }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-xs font-semibold capitalize" style={{ color: 'var(--text-secondary)' }}>{name}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    name={name} type={type} required
                    value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  name="password" type={show ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShow(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-display font-bold text-sm mt-2 transition-all disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#0a0a0f', boxShadow: '0 0 24px var(--accent-glow)' }}
            >
              {loading ? 'Creating account...' : `Join as ${form.role === 'student' ? 'Student' : 'Teacher'} →`}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}