import { useMemo } from 'react';
import { Github, Linkedin, Heart } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer
      className="px-6 py-5"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left — Logo + tagline */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SolveTracker"
            className="h-14 w-auto object-contain"
          />
          <span style={{ color: 'var(--border-2)' }}>·</span>
          <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
            AI-Powered DSA Learning System
          </span>
        </div>

        {/* Right — Copyright + socials */}
        <div className="flex items-center gap-3 flex-wrap justify-end">

          {/* Made by */}
          <span className="text-xs font-code flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} · Made with <Heart size={10} style={{ color: 'var(--hard)' }} /> by{' '}
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>Harsh Gupta</span>
          </span>

          <span style={{ color: 'var(--border-2)' }}>·</span>

          {/* GitHub */}
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

          {/* LinkedIn */}
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

        </div>

      </div>
    </footer>
  );
}