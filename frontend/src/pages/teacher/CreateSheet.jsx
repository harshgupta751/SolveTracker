import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save, ArrowLeft, Link as LinkIcon, StickyNote, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSheets } from '@/hooks/useSheets';
import DifficultyBadge from '@/components/shared/DifficultyBadge';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming',
  'Backtracking', 'Binary Search', 'Heaps', 'Stacks & Queues', 'Tries',
  'Sorting', 'Two Pointers', 'Sliding Window', 'Math', 'Bit Manipulation',
  'Divide & Conquer', 'Greedy', 'Union Find',
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

export default function CreateSheet() {
  const navigate = useNavigate();
  const { createSheet } = useSheets();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [problems,    setProblems]    = useState([emptyProblem()]);
  const [saving,      setSaving]      = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);

  // Auto-fill LeetCode URL from slug
  const fillFromUrl = (idx, url) => {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) {
      const slug = match[1];
      const title = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      updateProblem(idx, { url, title });
    } else {
      updateProblem(idx, { url });
    }
  };

  const updateProblem = (idx, patch) =>
    setProblems(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));

  const addProblem = () => {
    const next = emptyProblem();
    setProblems(prev => [...prev, next]);
    setExpandedIdx(problems.length);
  };

  const removeProblem = (idx) => {
    if (problems.length === 1) { toast.error('Sheet needs at least one problem'); return; }
    setProblems(prev => prev.filter((_, i) => i !== idx));
    if (expandedIdx >= problems.length - 1) setExpandedIdx(Math.max(0, expandedIdx - 1));
  };

  const handleSave = async () => {
    if (!title.trim())    { toast.error('Give the sheet a title'); return; }
    if (!problems.every(p => p.title && p.url)) {
      toast.error('All problems need a title and URL'); return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        dueDate:     dueDate || undefined,
        isPublished,
        problems:    problems.map(({ id, ...rest }) => rest),
      };
      await createSheet(payload);
      toast.success(`Sheet "${title}" created${isPublished ? ' & published' : ' as draft'}! 🎉`);
      navigate('/teacher');
    } catch (err) {
      toast.error(err.message || 'Failed to create sheet');
    } finally {
      setSaving(false);
    }
  };

  // Difficulty stats
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach(p => counts[p.difficulty]++);

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all font-code";
  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/teacher')}
          className="flex items-center gap-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} /> Back
        </motion.button>
        <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
          Create Sheet
        </h2>
      </motion.div>

      {/* Sheet metadata */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 space-y-4"
      >
        <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Sheet Details
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Title *</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Week 3 — Dynamic Programming Sprint"
            className={inputClass} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What should students focus on? Any tips?"
            rows={2}
            className={inputClass} style={{ ...inputStyle, resize: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Due Date (optional)</label>
            <input
              type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Visibility</label>
            <div className="flex gap-2">
              {[
                [false, EyeOff, 'Draft'],
                [true,  Eye,    'Published'],
              ].map(([val, Icon, label]) => (
                <motion.button
                  key={label}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsPublished(val)}
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

        {/* Stats bar */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
            {problems.length} problems
          </span>
          {Object.entries(counts).filter(([, c]) => c > 0).map(([d, c]) => (
            <div key={d} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: `var(--${d.toLowerCase()})` }} />
              <span className="text-xs font-code" style={{ color: `var(--${d.toLowerCase()})` }}>
                {c} {d}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Problems list */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Problems
          </h3>
          <span className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
            Drag to reorder
          </span>
        </div>

        <Reorder.Group axis="y" values={problems} onReorder={setProblems} className="space-y-3">
          {problems.map((p, idx) => (
            <Reorder.Item
              key={p.id}
              value={p}
              className="card overflow-hidden"
            >
              {/* Problem header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                style={{ borderBottom: expandedIdx === idx ? '1px solid var(--border)' : 'none' }}
                onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
              >
                <GripVertical size={14} className="cursor-grab flex-shrink-0" style={{ color: 'var(--text-muted)' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-code text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
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
                  whileHover={{ scale: 1.15, color: 'var(--hard)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); removeProblem(idx); }}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={13} />
                </motion.button>
              </div>

              {/* Problem editor */}
              <AnimatePresence initial={false}>
                {expandedIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 grid gap-3">
                      {/* Title + URL row */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold flex items-center gap-1.5"
                                 style={{ color: 'var(--text-secondary)' }}>
                            <Tag size={11} /> Problem Title *
                          </label>
                          <input
                            value={p.title}
                            onChange={e => updateProblem(idx, { title: e.target.value })}
                            placeholder="Two Sum"
                            className={inputClass} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold flex items-center gap-1.5"
                                 style={{ color: 'var(--text-secondary)' }}>
                            <LinkIcon size={11} /> LeetCode URL *
                          </label>
                          <input
                            value={p.url}
                            onChange={e => fillFromUrl(idx, e.target.value)}
                            placeholder="https://leetcode.com/problems/two-sum"
                            className={inputClass} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                          />
                        </div>
                      </div>

                      {/* Difficulty + Topic row */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            Difficulty
                          </label>
                          <div className="flex gap-1.5">
                            {DIFFICULTIES.map(d => (
                              <motion.button
                                key={d}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateProblem(idx, { difficulty: d })}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                  background: p.difficulty === d ? `var(--${d.toLowerCase()}-bg)` : 'var(--bg-2)',
                                  border:     p.difficulty === d ? `1px solid var(--${d.toLowerCase()})` : '1px solid var(--border)',
                                  color:      p.difficulty === d ? `var(--${d.toLowerCase()})` : 'var(--text-muted)',
                                }}
                              >
                                {d}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            Topic
                          </label>
                          <select
                            value={p.topic}
                            onChange={e => updateProblem(idx, { topic: e.target.value })}
                            className={inputClass} style={{ ...inputStyle, cursor: 'pointer' }}
                          >
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold flex items-center gap-1.5"
                               style={{ color: 'var(--text-secondary)' }}>
                          <StickyNote size={11} /> Teacher Notes (optional)
                        </label>
                        <input
                          value={p.notes}
                          onChange={e => updateProblem(idx, { notes: e.target.value })}
                          placeholder="Hint: use a hash map. Focus on O(n) time complexity."
                          className={inputClass} style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Add problem button */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
          whileTap={{ scale: 0.98 }}
          onClick={addProblem}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            border:  '1px dashed var(--border-2)',
            color:   'var(--text-muted)',
            background: 'transparent',
          }}
        >
          <Plus size={14} /> Add Problem
        </motion.button>
      </motion.div>

      {/* Save bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-4 flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: 'var(--surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div>
          <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {title || 'Untitled Sheet'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {problems.length} problems · {isPublished ? 'Will be published' : 'Will be saved as draft'}
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-60"
          style={{ background: 'var(--accent)', color: '#0a0a0f', boxShadow: '0 0 20px var(--accent-glow)' }}
        >
          <Save size={14} />
          {saving ? 'Saving...' : isPublished ? 'Publish Sheet' : 'Save Draft'}
        </motion.button>
      </motion.div>
    </div>
  );
}