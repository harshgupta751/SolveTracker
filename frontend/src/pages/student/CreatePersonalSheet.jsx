import { useState }                        from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, Trash2, GripVertical, Save, Tag, Link as LinkIcon, StickyNote } from 'lucide-react';
import DifficultyBadge from '@/components/shared/DifficultyBadge';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays','Strings','Linked Lists','Trees','Graphs','Dynamic Programming',
  'Backtracking','Binary Search','Heaps','Stacks & Queues','Tries',
  'Sorting','Two Pointers','Sliding Window','Math','Bit Manipulation',
];

const emptyProblem = () => ({
  id: Math.random().toString(36).slice(2),
  title: '', url: '', difficulty: 'Medium', topic: 'Arrays', notes: '',
});

export default function CreatePersonalSheet({ onSave, onClose }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [problems,    setProblems]    = useState([emptyProblem()]);
  const [saving,      setSaving]      = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);

  const updateProblem = (idx, patch) =>
    setProblems((prev) => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));

  const fillFromUrl = (idx, url) => {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) {
      const slug  = match[1];
      const title = slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      updateProblem(idx, { url, title });
    } else {
      updateProblem(idx, { url });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    if (problems.some((p) => !p.title || !p.url)) return;
    setSaving(true);
    await onSave({
      title, description,
      problems: problems.map(({ id, ...rest }) => rest),
      isPersonal: true,
    });
    setSaving(false);
  };

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' };
  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all font-code";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.93, opacity: 0, y: 24  }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
             style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div>
            <h3 className="font-display font-black text-lg" style={{ color: 'var(--text-primary)' }}>
              Create Personal Sheet
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Private to you — track your own practice goals
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                         onClick={onClose} className="p-2 rounded-xl"
                         style={{ background: 'var(--bg-2)', color: 'var(--text-muted)' }}>
            <X size={16} />
          </motion.button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sheet info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder="e.g. My DP Practice" className={inputClass} style={inputStyle}
                     onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                     onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                     placeholder="What's this sheet for?" className={inputClass} style={inputStyle}
                     onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                     onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>

          {/* Problems */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Problems ({problems.length})
              </p>
              <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Drag to reorder</span>
            </div>

            <Reorder.Group axis="y" values={problems} onReorder={setProblems} className="space-y-2">
              {problems.map((p, idx) => (
                <Reorder.Item key={p.id} value={p} className="card overflow-hidden">
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    style={{ borderBottom: expandedIdx === idx ? '1px solid var(--border)' : 'none' }}
                    onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                  >
                    <GripVertical size={13} className="cursor-grab flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {p.title || 'Untitled'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <DifficultyBadge difficulty={p.difficulty} />
                        <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{p.topic}</span>
                      </div>
                    </div>
                    {problems.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setProblems((prev) => prev.filter((_, i) => i !== idx)); }}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedIdx === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 grid gap-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold flex items-center gap-1"
                                     style={{ color: 'var(--text-secondary)' }}>
                                <Tag size={10} /> Title *
                              </label>
                              <input value={p.title} onChange={(e) => updateProblem(idx, { title: e.target.value })}
                                     placeholder="Two Sum" className={inputClass} style={inputStyle}
                                     onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                                     onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')} />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold flex items-center gap-1"
                                     style={{ color: 'var(--text-secondary)' }}>
                                <LinkIcon size={10} /> URL *
                              </label>
                              <input value={p.url} onChange={(e) => fillFromUrl(idx, e.target.value)}
                                     placeholder="https://leetcode.com/problems/..." className={inputClass} style={inputStyle}
                                     onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                                     onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')} />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
                              <div className="flex gap-1.5">
                                {DIFFICULTIES.map((d) => (
                                  <motion.button key={d} type="button" whileTap={{ scale: 0.95 }}
                                                onClick={() => updateProblem(idx, { difficulty: d })}
                                                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                                                style={{
                                                  background: p.difficulty === d ? `var(--${d.toLowerCase()}-bg)` : 'var(--bg-2)',
                                                  border:     p.difficulty === d ? `1px solid var(--${d.toLowerCase()})` : '1px solid var(--border)',
                                                  color:      p.difficulty === d ? `var(--${d.toLowerCase()})` : 'var(--text-muted)',
                                                }}>
                                    {d}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Topic</label>
                              <select value={p.topic} onChange={(e) => updateProblem(idx, { topic: e.target.value })}
                                      className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold flex items-center gap-1"
                                   style={{ color: 'var(--text-secondary)' }}>
                              <StickyNote size={10} /> Notes
                            </label>
                            <input value={p.notes} onChange={(e) => updateProblem(idx, { notes: e.target.value })}
                                   placeholder="Your personal notes..." className={inputClass} style={inputStyle}
                                   onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                                   onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setProblems((prev) => [...prev, emptyProblem()]); setExpandedIdx(problems.length); }}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ border: '1px dashed var(--border-2)', color: 'var(--text-muted)', background: 'transparent' }}
            >
              <Plus size={14} /> Add Problem
            </motion.button>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}>
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              disabled={saving || !title.trim() || problems.some((p) => !p.title || !p.url)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0a0f' }}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Create Sheet'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}