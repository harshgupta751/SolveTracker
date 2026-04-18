import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft, Save, Trash2, GripVertical, Plus, Eye, EyeOff,
  AlertTriangle, StickyNote, Link as LinkIcon, Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSheets } from '@/hooks/useSheets';
import DifficultyBadge from '@/components/shared/DifficultyBadge';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming',
  'Backtracking', 'Binary Search', 'Heaps', 'Stacks & Queues', 'Tries',
  'Sorting', 'Two Pointers', 'Sliding Window', 'Math', 'Bit Manipulation',
];

const emptyProblem = () => ({
  id:         Math.random().toString(36).slice(2),
  title:      '',
  url:        '',
  difficulty: 'Medium',
  topic:      'Arrays',
  notes:      '',
  isCustom:   false,
});

// ─── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ sheet, onConfirm, onCancel, deleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1,   opacity: 1, y: 0  }}
        exit={{    scale: 0.9, opacity: 0, y: 20  }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="card p-6 max-w-md w-full"
        style={{ border: '1px solid var(--hard)', background: 'var(--surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
             style={{ background: 'var(--hard-bg)', border: '1px solid var(--hard)' }}>
          <AlertTriangle size={22} style={{ color: 'var(--hard)' }} />
        </div>

        <h3 className="font-display font-black text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Delete this sheet?
        </h3>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          You're about to permanently delete:
        </p>
        <p className="font-code text-sm font-semibold mb-4 px-3 py-2 rounded-lg"
           style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }}>
          "{sheet.title}"
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          This will remove all {sheet.problems?.length ?? 0} problems and any student progress on this sheet. This cannot be undone.
        </p>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: 'var(--hard)', color: '#fff' }}
          >
            {deleting ? 'Deleting...' : 'Delete Sheet'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SheetEditor() {
  const { sheetId }     = useParams();
  const navigate        = useNavigate();
  const { sheets, updateSheet, removeSheet } = useSheets();

  const sheet = sheets.find(s => s._id === sheetId);

  const [title,       setTitle]       = useState(sheet?.title       ?? '');
  const [description, setDescription] = useState(sheet?.description ?? '');
  const [dueDate,     setDueDate]     = useState(sheet?.dueDate ? new Date(sheet.dueDate).toISOString().split('T')[0] : '');
  const [isPublished, setIsPublished] = useState(sheet?.isPublished ?? false);
  const [problems,    setProblems]    = useState(
    (sheet?.problems ?? []).map(p => ({ ...p, id: Math.random().toString(36).slice(2) }))
  );
  const [saving,      setSaving]      = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(-1);
  const [dirty,       setDirty]       = useState(false);

  // Sync sheet data when sheets load
  useEffect(() => {
    if (sheet && !dirty) {
      setTitle(sheet.title);
      setDescription(sheet.description ?? '');
      setIsPublished(sheet.isPublished);
      setProblems((sheet.problems ?? []).map(p => ({ ...p, id: Math.random().toString(36).slice(2) })));
    }
  }, [sheet]);

  if (!sheet) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
          Sheet not found — it may have been deleted.
        </p>
      </div>
    );
  }

  const updateProblem = (idx, patch) => {
    setDirty(true);
    setProblems(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  };

  const fillFromUrl = (idx, url) => {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) {
      const slug  = match[1];
      const title = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      updateProblem(idx, { url, title });
    } else {
      updateProblem(idx, { url });
    }
  };

  const addProblem = () => {
    setDirty(true);
    setProblems(prev => [...prev, emptyProblem()]);
    setExpandedIdx(problems.length);
  };

  const removeProblem = (idx) => {
    if (problems.length === 1) { toast.error('Minimum 1 problem required'); return; }
    setDirty(true);
    setProblems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim())   { toast.error('Sheet needs a title'); return; }
    if (problems.some(p => !p.title || !p.url)) { toast.error('All problems need title + URL'); return; }

    setSaving(true);
    try {
      await updateSheet(sheetId, {
        title, description, dueDate: dueDate || undefined, isPublished,
        problems: problems.map(({ id, ...rest }) => rest),
      });
      setDirty(false);
      toast.success('Sheet updated! ✅');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeSheet(sheetId);
      toast.success('Sheet deleted');
      navigate('/teacher');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' };
  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all font-code";

  return (
    <>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate('/teacher')}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} /> Back
            </motion.button>
            <h2 className="font-display font-black text-xl" style={{ color: 'var(--text-primary)' }}>
              Edit Sheet
            </h2>
            {dirty && (
              <span className="text-xs font-code px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--medium-bg)', color: 'var(--medium)', border: '1px solid var(--medium)' }}>
                unsaved changes
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ border: '1px solid var(--hard)', color: 'var(--hard)', background: 'var(--hard-bg)' }}
          >
            <Trash2 size={12} /> Delete Sheet
          </motion.button>
        </motion.div>

        {/* Metadata card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-4"
        >
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sheet Details</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }}
                   placeholder="Sheet title" className={inputClass} style={inputStyle}
                   onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                   onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={description} onChange={e => { setDescription(e.target.value); setDirty(true); }}
                      rows={2} className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => { setDueDate(e.target.value); setDirty(true); }}
                     className={inputClass} style={inputStyle}
                     onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                     onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Visibility</label>
              <div className="flex gap-2">
                {[[false, EyeOff, 'Draft'], [true, Eye, 'Published']].map(([val, Icon, label]) => (
                  <motion.button
                    key={label} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => { setIsPublished(val); setDirty(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: isPublished === val ? 'var(--accent-glow)' : 'var(--bg-2)',
                      border:     isPublished === val ? '1px solid var(--accent)' : '1px solid var(--border)',
                      color:      isPublished === val ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    <Icon size={12} /> {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problems */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Problems ({problems.length})
            </h3>
            <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>Drag to reorder</span>
          </div>

          <Reorder.Group axis="y" values={problems} onReorder={(p) => { setProblems(p); setDirty(true); }}
                         className="space-y-3">
            {problems.map((p, idx) => (
              <Reorder.Item key={p.id} value={p} className="card overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                  style={{ borderBottom: expandedIdx === idx ? '1px solid var(--border)' : 'none' }}
                  onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                >
                  <GripVertical size={14} className="cursor-grab flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.title || 'Untitled problem'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <DifficultyBadge difficulty={p.difficulty} />
                      <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>{p.topic}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); removeProblem(idx); }}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </div>

                <AnimatePresence initial={false}>
                  {expandedIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 grid gap-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold flex items-center gap-1"
                                   style={{ color: 'var(--text-secondary)' }}>
                              <Tag size={11} /> Title *
                            </label>
                            <input value={p.title} onChange={e => updateProblem(idx, { title: e.target.value })}
                                   placeholder="Two Sum" className={inputClass} style={inputStyle}
                                   onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                   onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold flex items-center gap-1"
                                   style={{ color: 'var(--text-secondary)' }}>
                              <LinkIcon size={11} /> LeetCode URL *
                            </label>
                            <input value={p.url} onChange={e => fillFromUrl(idx, e.target.value)}
                                   placeholder="https://leetcode.com/problems/..." className={inputClass} style={inputStyle}
                                   onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                   onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
                            <div className="flex gap-1.5">
                              {DIFFICULTIES.map(d => (
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
                            <select value={p.topic} onChange={e => updateProblem(idx, { topic: e.target.value })}
                                    className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}>
                              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold flex items-center gap-1"
                                 style={{ color: 'var(--text-secondary)' }}>
                            <StickyNote size={11} /> Notes
                          </label>
                          <input value={p.notes} onChange={e => updateProblem(idx, { notes: e.target.value })}
                                 placeholder="Hint or context for students..." className={inputClass} style={inputStyle}
                                 onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                 onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <motion.button
            whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
            whileTap={{ scale: 0.98 }}
            onClick={addProblem}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ border: '1px dashed var(--border-2)', color: 'var(--text-muted)', background: 'transparent' }}
          >
            <Plus size={14} /> Add Problem
          </motion.button>
        </motion.div>

        {/* Save bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="sticky bottom-4 flex items-center justify-between px-5 py-4 rounded-2xl"
          style={{ background: 'var(--surface)', border: `1px solid ${dirty ? 'var(--accent)' : 'var(--border)'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        >
          <div>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title || 'Untitled'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {problems.length} problems · {dirty ? '⚠ Unsaved changes' : '✓ Up to date'}
            </p>
          </div>
          <motion.button
            onClick={handleSave} disabled={saving || !dirty}
            whileHover={{ scale: (saving || !dirty) ? 1 : 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: dirty ? 'var(--accent)' : 'var(--border)', color: dirty ? '#0a0a0f' : 'var(--text-muted)', boxShadow: dirty ? '0 0 20px var(--accent-glow)' : 'none' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDelete && (
          <DeleteModal
            sheet={sheet}
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </>
  );
}