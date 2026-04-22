import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }                   from 'framer-motion';
import { X, Send, Bot, User, Minimize2, Sparkles, GraduationCap, BookOpen, MessageCircle } from 'lucide-react';
import { aiAPI }            from '@/api';
import useAuthStore         from '@/store/authStore';
import { useLeetcodeStats } from '@/hooks/useLeetcode';

// ─── Markdown parser ──────────────────────────────────────────────────────────
function parseMarkdown(text) {
  const tokens = [];
  const regex  = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0, match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex)
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    const raw = match[0];
    if (raw.startsWith('**'))     tokens.push({ type: 'bold',   content: raw.slice(2, -2) });
    else if (raw.startsWith('`')) tokens.push({ type: 'code',   content: raw.slice(1, -1) });
    else                          tokens.push({ type: 'italic', content: raw.slice(1, -1) });
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length)
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  return tokens;
}

function ParsedMessage({ content }) {
  const tokens = parseMarkdown(content);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === 'bold')
          return <strong key={i} style={{ fontWeight: 600, color: 'inherit' }}>{t.content}</strong>;
        if (t.type === 'italic')
          return <em key={i}>{t.content}</em>;
        if (t.type === 'code')
          return (
            <code key={i} style={{
              background: 'var(--border)', padding: '1px 5px',
              borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88em',
            }}>
              {t.content}
            </code>
          );
        return t.content.split('\n').map((line, j) => (
          <span key={`${i}-${j}`}>{j > 0 && <br />}{line}</span>
        ));
      })}
    </>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full"
                     style={{ background: 'var(--text-muted)' }}
                     animate={{ y: [0, -4, 0] }}
                     transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }} />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
           style={{
             background: isUser ? 'var(--accent-glow)' : 'rgba(66,133,244,0.15)',
             border:     isUser ? '1px solid var(--accent)' : '1px solid rgba(66,133,244,0.3)',
           }}>
        {isUser
          ? <User size={11} style={{ color: 'var(--accent)' }} />
          : <Bot  size={11} style={{ color: '#4285f4' }} />}
      </div>

      <div
        className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
        style={{
          background:              isUser ? 'var(--accent)' : 'var(--bg-2)',
          color:                   isUser ? '#0a0a0f'       : 'var(--text-primary)',
          borderBottomRightRadius: isUser ? 4 : undefined,
          borderBottomLeftRadius:  isUser ? undefined : 4,
          border:                  isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {isUser ? msg.content : <ParsedMessage content={msg.content} />}
      </div>
    </motion.div>
  );
}

// ─── Context-aware config ─────────────────────────────────────────────────────
const STUDENT_SUGGESTIONS = [
  "How do I improve my acceptance rate?",
  "What DSA topics should I focus on for placements?",
  "Explain the sliding window pattern",
  "How to approach DP problems?",
];

const TEACHER_SUGGESTIONS = [
  "How do I identify struggling students?",
  "What problem set should I assign this week?",
  "Suggest a topic for my next lecture",
  "How to improve class acceptance rate?",
];

const getGreeting = (user, isTeacher) => {
  const first = user?.name?.split(' ')[0] ?? (isTeacher ? 'Professor' : 'there');
  if (isTeacher) {
    return `Hey ${first}! 👋 I'm DSA Buddy — your teaching assistant. I can help you track class progress, plan problem sheets, identify struggling students, and design a placement-ready curriculum. What do you need help with?`;
  }
  return `Hey ${first}! 👋 I'm DSA Buddy — your personal coding coach. I can help you master DSA patterns, prep for tech interviews, understand tricky problems, and build a study plan. Let's crack that placement! 🚀`;
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Chatbot() {
  const { user, isTeacher } = useAuthStore();
  const { stats }           = useLeetcodeStats();
  const teacher             = isTeacher();

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: getGreeting(user, teacher) },
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(0);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [open]);

  const userContext = teacher
    ? {
        name:  user?.name,
        role:  'teacher',
        myClassCode: user?.myClassCode,
      }
    : {
        name:             user?.name,
        role:             'student',
        leetcodeUsername: user?.leetcodeUsername,
        totalSolved:      stats?.totalSolved,
        easySolved:       stats?.easySolved,
        mediumSolved:     stats?.mediumSolved,
        hardSolved:       stats?.hardSolved,
        acceptanceRate:   stats?.acceptanceRate,
        ranking:          stats?.ranking,
        topTopics:        stats?.topicStats
          ? Object.entries(
              stats.topicStats instanceof Map
                ? Object.fromEntries(stats.topicStats)
                : stats.topicStats
            ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t).join(', ')
          : '',
      };

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg  = { role: 'user', content };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const res = await aiAPI.chat(
        nextMsgs.map(m => ({ role: m.role, content: m.content })),
        userContext
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.text }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again in a moment 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, open, userContext]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = teacher ? TEACHER_SUGGESTIONS : STUDENT_SUGGESTIONS;
  const headerIcon  = teacher ? BookOpen : GraduationCap;
  const HeaderIcon  = headerIcon;

  return (
    <>
      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="cw"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.92, y: 20   }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width:      364,
              height:     520,
              background: 'var(--surface)',
              border:     '1px solid var(--border)',
              boxShadow:  '0 24px 64px rgba(0,0,0,0.38)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                 style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: teacher ? 'rgba(129,140,248,0.15)' : 'rgba(66,133,244,0.12)',
                              border: teacher ? '1px solid rgba(129,140,248,0.35)' : '1px solid rgba(66,133,244,0.3)' }}>
                  <HeaderIcon size={15} style={{ color: teacher ? '#818cf8' : '#4285f4' }} />
                </div>
                <div>
                  <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    DSA Buddy
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--easy)' }} />
                    <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                      {teacher ? 'Teaching assistant' : 'Your AI coding coach'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                               onClick={() => setOpen(false)}
                               className="w-7 h-7 rounded-lg flex items-center justify-center"
                               style={{ color: 'var(--text-muted)' }}>
                  <Minimize2 size={13} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                               onClick={() => setOpen(false)}
                               className="w-7 h-7 rounded-lg flex items-center justify-center"
                               style={{ color: 'var(--text-muted)' }}>
                  <X size={13} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                       style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)' }}>
                    <Bot size={11} style={{ color: '#4285f4' }} />
                  </div>
                  <div className="rounded-2xl rounded-bl-[4px]"
                       style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-col gap-1.5">
                {suggestions.slice(0, 3).map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-2 rounded-xl text-left transition-all"
                    style={{
                      background: 'var(--bg-2)',
                      border:     '1px solid var(--border)',
                      color:      'var(--text-secondary)',
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
                 style={{ borderTop: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={teacher ? 'Ask about your class...' : 'Ask about DSA or your progress...'}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none font-code transition-all disabled:opacity-50"
                style={{
                  background: 'var(--bg-2)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = teacher ? '#818cf8' : '#4285f4')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                style={{ background: teacher ? '#818cf8' : '#4285f4', color: '#fff' }}
              >
                <Send size={13} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating bubble ── */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: open ? 'var(--bg-2)' : teacher ? '#818cf8' : '#4285f4',
          border:     open ? '1px solid var(--border)' : 'none',
          boxShadow:  open ? 'none' : teacher
            ? '0 8px 32px rgba(129,140,248,0.45)'
            : '0 8px 32px rgba(66,133,244,0.45)',
        }}
        aria-label="Open DSA Buddy"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          ) : (
            <motion.div key="bot"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} style={{ color: '#fff' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--hard)', color: '#fff' }}
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}