import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }                   from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles } from 'lucide-react';
import { aiAPI }          from '@/api';
import useAuthStore       from '@/store/authStore';
import { useLeetcodeStats } from '@/hooks/useLeetcode';

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--text-muted)' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
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
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
        style={{
          background: isUser ? 'var(--accent-glow)' : 'rgba(66,133,244,0.15)',
          border:     isUser ? '1px solid var(--accent)' : '1px solid rgba(66,133,244,0.3)',
        }}
      >
        {isUser
          ? <User size={11} style={{ color: 'var(--accent)' }} />
          : <Bot  size={11} style={{ color: '#4285f4'       }} />
        }
      </div>

      {/* Bubble */}
      <div
        className="max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
        style={{
          background: isUser ? 'var(--accent)' : 'var(--bg-2)',
          color:      isUser ? '#0a0a0f'        : 'var(--text-primary)',
          borderBottomRightRadius: isUser ? 4 : undefined,
          borderBottomLeftRadius:  isUser ? undefined : 4,
          border:     isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Explain Dynamic Programming",
  "How to approach graph problems?",
  "Tips to improve acceptance rate",
  "What's the best way to study Trees?",
  "How to practice for interviews?",
];

// ─── Main Chatbot ─────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { user }      = useAuthStore();
  const { stats }     = useLeetcodeStats();
  const [open,    setOpen]    = useState(false);
  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      content: `Hey ${user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm DSA Buddy — your AI coach on DSA&Chill. Ask me anything about algorithms, problem-solving strategies, or the platform! 🚀`,
    },
  ]);
  const [input,    setInput]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [unread,   setUnread]  = useState(0);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const userContext = {
    name:        user?.name,
    role:        user?.role,
    leetcodeUsername: user?.leetcodeUsername,
    totalSolved: stats?.totalSolved,
    rank:        stats?.ranking,
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
        nextMsgs.map((m) => ({ role: m.role, content: m.content })),
        userContext
      );
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.text },
      ]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again in a moment 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, open, userContext]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.92, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1,    y: 0               }}
            exit={{    opacity: 0, scale: 0.92, y: 20               }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width:     364,
              height:    520,
              background: 'var(--surface)',
              border:    '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: '1px solid var(--border)',
                background:   'var(--surface)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.3)' }}
                >
                  <Bot size={15} style={{ color: '#4285f4' }} />
                </div>
                <div>
                  <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    DSA Buddy
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--easy)' }} />
                    <p className="text-xs font-code" style={{ color: 'var(--text-muted)' }}>
                      Powered by Gemini 2.5 Flash
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Minimize2 size={13} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={13} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex items-end gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)' }}
                  >
                    <Bot size={11} style={{ color: '#4285f4' }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-[4px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions — only shown when only the greeting is visible */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1.5 rounded-xl transition-all"
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
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything about DSA..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none font-code transition-all disabled:opacity-50"
                style={{
                  background: 'var(--bg-2)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#4285f4')}
                onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: '#4285f4', color: '#fff' }}
              >
                <Send size={13} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating bubble ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{ boxShadow: open ? 'none' : '0 0 0 0 rgba(66,133,244,0.4)' }}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: open ? 'var(--bg-2)' : '#4285f4',
          border:     open ? '1px solid var(--border)' : 'none',
          boxShadow:  open ? 'none' : '0 8px 32px rgba(66,133,244,0.45)',
        }}
        aria-label="Open DSA Buddy chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles size={22} style={{ color: '#fff' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
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