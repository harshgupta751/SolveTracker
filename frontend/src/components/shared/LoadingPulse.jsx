import { motion } from 'framer-motion';

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="h-4 rounded-lg w-1/3 skeleton" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded-lg skeleton" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="h-3 w-20 rounded skeleton" />
        <div className="h-8 w-8 rounded-lg skeleton" />
      </div>
      <div className="h-8 w-24 rounded-lg skeleton" />
      <div className="h-2 w-full rounded skeleton" />
    </div>
  );
}

// Full-page loader
export default function LoadingPulse() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
      >
        <span className="text-xl">⚡</span>
      </motion.div>
      <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading...
      </p>
    </div>
  );
}