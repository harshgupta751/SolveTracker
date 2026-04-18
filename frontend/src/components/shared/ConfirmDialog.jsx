import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  danger       = false,
  loading      = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.92, opacity: 0, y: 24  }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="card p-6 max-w-sm w-full"
            style={{
              border:     `1px solid ${danger ? 'var(--hard)' : 'var(--border)'}`,
              background: 'var(--surface)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {danger && (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                   style={{ background: 'var(--hard-bg)', border: '1px solid var(--hard)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--hard)' }} />
              </div>
            )}

            <h3 className="font-display font-black text-lg mb-2"
                style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm mb-6 leading-relaxed"
               style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{
                  background: danger ? 'var(--hard)' : 'var(--accent)',
                  color:      danger ? '#fff' : '#0a0a0f',
                }}
              >
                {loading ? 'Working...' : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}