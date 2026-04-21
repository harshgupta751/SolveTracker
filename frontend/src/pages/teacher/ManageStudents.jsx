import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }           from 'framer-motion';
import {
  UserPlus, Trash2, Mail, Clock, Users,
  CheckCircle2, XCircle, Search, Wifi, WifiOff,
  ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import { studentsAPI } from '@/api';
import { relativeTime } from '@/lib/utils';
import ConfirmDialog    from '@/components/shared/ConfirmDialog';
import { CardSkeleton } from '@/components/shared/LoadingPulse';

export default function ManageStudents() {
  const navigate = useNavigate();
  const [enrolled,  setEnrolled]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [email,     setEmail]     = useState('');
  const [inviting,  setInviting]  = useState(false);
  const [search,    setSearch]    = useState('');
  const [confirm,   setConfirm]   = useState(null); // { type: 'remove'|'cancel', payload }

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll();
      setEnrolled(res.data.enrolled);
      setPending(res.data.pending);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await studentsAPI.invite(email.trim());
      toast.success(res.data.message);
      setEmail('');
      if (res.data.enrolled) {
        setEnrolled((prev) => [...prev, res.data.student]);
      } else {
        setPending((prev) => [...prev, res.data.pending]);
      }
    } catch (err) {
      toast.error(err.message || 'Invite failed');
    } finally { setInviting(false); }
  };

  const handleRemove = async () => {
    const student = confirm.payload;
    try {
      await studentsAPI.remove(student._id);
      setEnrolled((prev) => prev.filter((s) => s._id !== student._id));
      toast.success(`${student.name} removed from class`);
    } catch (err) { toast.error(err.message || 'Remove failed'); }
    finally { setConfirm(null); }
  };

  const handleCancelInvite = async () => {
    const em = confirm.payload;
    try {
      await studentsAPI.cancelInvite(em);
      setPending((prev) => prev.filter((e) => e !== em));
      toast.success('Invitation cancelled');
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setConfirm(null); }
  };

  const filtered = enrolled.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.leetcodeUsername ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4">
          <motion.button whileHover={{ x: -4 }} onClick={() => navigate('/teacher')}
                         className="flex items-center gap-2 text-sm"
                         style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={14} /> Back
          </motion.button>
          <div>
            <h2 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
              Manage Students
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {enrolled.length} enrolled · {pending.length} pending
            </p>
          </div>
        </motion.div>

        {/* Invite form */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
              <UserPlus size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Add Student by Email
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                If they're registered, they're enrolled immediately. Otherwise they'll be auto-enrolled when they sign up.
              </p>
            </div>
          </div>

          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="relative flex-1">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all font-code"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <motion.button
              type="submit"
              disabled={inviting || !email.trim()}
              whileHover={{ scale: inviting ? 1 : 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0a0f' }}
            >
              <UserPlus size={14} />
              {inviting ? 'Adding...' : 'Add Student'}
            </motion.button>
          </form>
        </motion.div>

        {/* Enrolled students */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
               style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: 'var(--accent)' }} />
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Enrolled Students
              </h3>
              <span className="text-xs font-code px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {enrolled.length}
              </span>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-3 py-1.5 rounded-xl text-xs font-code outline-none w-36 transition-all"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-5"><CardSkeleton lines={4} /></div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <Users size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-code text-sm" style={{ color: 'var(--text-muted)' }}>
                {enrolled.length === 0
                  ? 'No students yet. Add students by email above.'
                  : 'No students match your search.'}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <AnimatePresence initial={false}>
                {filtered.map((student, i) => (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {student.avatar ? (
                        <img src={student.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                             style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                            style={{ background: 'var(--easy)', borderColor: 'var(--surface)' }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                          {student.email}
                        </p>
                        {student.leetcodeUsername && (
                          <span className="text-xs font-code"
                                style={{ color: 'var(--accent)' }}>
                            @{student.leetcodeUsername}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Enrolled date */}
                    <span className="text-xs font-code hidden sm:block"
                          style={{ color: 'var(--text-muted)' }}>
                      Joined {relativeTime(new Date(student.createdAt).getTime())}
                    </span>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setConfirm({ type: 'remove', payload: student })}
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'var(--hard-bg)', color: 'var(--hard)', border: '1px solid transparent' }}
                      title="Remove student"
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Pending invitations */}
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }} className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <Clock size={14} style={{ color: 'var(--medium)' }} />
              <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Pending Invitations
              </h3>
              <span className="text-xs font-code px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--medium-bg)', color: 'var(--medium)' }}>
                {pending.length}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {pending.map((em, i) => (
                <motion.div
                  key={em}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                         style={{ background: 'var(--medium-bg)', border: '1px solid var(--medium)' }}>
                      <Mail size={12} style={{ color: 'var(--medium)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-code" style={{ color: 'var(--text-primary)' }}>{em}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Will be enrolled when they register
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirm({ type: 'cancel', payload: em })}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                    title="Cancel invitation"
                  >
                    <XCircle size={15} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirm?.type === 'remove'}
        title="Remove Student?"
        message={`${confirm?.payload?.name} will be removed from your class. Their progress data is preserved — you can re-add them anytime.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        danger
        onConfirm={handleRemove}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'cancel'}
        title="Cancel Invitation?"
        message={`Cancel the invitation for ${confirm?.payload}? They won't be auto-enrolled if they register.`}
        confirmLabel="Cancel Invite"
        cancelLabel="Keep"
        danger
        onConfirm={handleCancelInvite}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}