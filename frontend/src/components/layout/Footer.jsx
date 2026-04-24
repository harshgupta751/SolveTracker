import { useMemo }    from 'react';
import { Link }       from 'react-router-dom';
import { Zap, Github, Linkedin, Heart } from 'lucide-react';
import useAuthStore   from '@/store/authStore';

export default function Footer() {
  const { user, isTeacher } = useAuthStore();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const teacher     = isTeacher();

  const LINKS = teacher ? [
    { label: 'Overview',    to: '/teacher'              },
    { label: 'Students',    to: '/teacher/students'     },
    { label: 'New Sheet',   to: '/teacher/create-sheet' },
    { label: 'Leaderboard', to: '/teacher/leaderboard'  },
  ] : [
    { label: 'Dashboard',   to: '/student'              },
    { label: 'My Sheets',   to: '/student/sheets'       },
    { label: 'Progress',    to: '/student/progress'     },
    { label: 'Leaderboard', to: '/student/leaderboard'  },
  ];

  return (
    <footer
      className="px-6 py-8 mt-auto"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
            >
              <Zap size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                DSA<span style={{ color: 'var(--accent)' }}>&amp;Chill</span>
              </span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                AI-Powered DSA Learning System
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-5 flex-wrap">
            {LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-xs font-code transition-colors hover:underline"
                style={{ color: 'var(--text-muted)', textUnderlineOffset: 3 }}
                onMouseEnter={e => (e.target.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.target.style.color = 'var(--text-muted)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 20 }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Copyright + made by */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
              © {currentYear} DSA&amp;Chill
            </span>
            <span style={{ color: 'var(--border-2)' }}>·</span>
            <span className="text-xs font-code flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              Made with <Heart size={10} style={{ color: 'var(--hard)' }} /> by{' '}
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                CodeBuilders
              </span>
            </span>
          </div>

          {/* Social + stack */}
          <div className="flex items-center gap-3">
              <a
              href="https://github.com/harshgupta751"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              title="GitHub"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Github size={13} />
            </a>
              <a
              href="https://linkedin.com/in/harshachieve100"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              title="LinkedIn"
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0077b5'; e.currentTarget.style.color = '#0077b5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Linkedin size={13} />
            </a>
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              {['React', 'Node', 'MongoDB', 'Gemini'].map((t, i, arr) => (
                <span key={t}>
                  <span className="font-code" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{t}</span>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'var(--border-2)', fontSize: 9, margin: '0 3px' }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}