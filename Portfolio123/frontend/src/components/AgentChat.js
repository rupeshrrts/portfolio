'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { loadChatHistory, sendChatMessage, startNewChat } from '@/lib/chat';
import { profile } from '@/data/profile';

const STARTERS = ['What is AgentShieldAI?', 'What does he do now?', 'Tell me about his AI work', 'Top projects?', 'How can I contact him?'];
const GREETING = {
  from: 'agent',
  text: `Hi! I'm ${profile.firstName}'s AI assistant 👋 Ask me anything about his work, projects, skills or education.`,
};

// Domains end on a word character so a sentence's trailing "." is never swallowed into the link.
const LINK_RE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|(?:https?:\/\/)?(?:github\.com|[\w-]+\.vercel\.app)(?:\/[\w./-]*\w)?)/g;

// Turns emails and known URLs inside an answer into clickable links.
function Linkified({ text }) {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const href = part.includes('@') ? `mailto:${part}` : part.startsWith('http') ? part : `https://${part}`;
    return (
      <a key={i} href={href} target={part.includes('@') ? undefined : '_blank'} rel="noreferrer">
        {part}
      </a>
    );
  });
}

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState(STARTERS);
  const [lastTopic, setLastTopic] = useState(null);
  const [messages, setMessages] = useState([GREETING]);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const historyLoaded = useRef(false);

  // Restore the saved conversation the first time the chat is opened.
  useEffect(() => {
    if (!open || historyLoaded.current) return;
    historyLoaded.current = true;
    loadChatHistory().then((history) => {
      if (!history.length) return;
      const restored = history.map((m) => ({ from: m.role === 'user' ? 'user' : 'agent', text: m.content }));
      setMessages((current) => (current.length > 1 ? current : [GREETING, ...restored]));
    });
  }, [open]);

  const newChat = () => {
    startNewChat();
    setMessages([GREETING]);
    setSuggestions(STARTERS);
    setLastTopic(null);
  };

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('open-agent', onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('open-agent', onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    // Lock page scroll while the full-screen chat is open on phones.
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    document.body.style.overflow = open && mobile ? 'hidden' : '';
    if (open && !mobile) setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const send = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text: q }]);
    setBusy(true);
    try {
      const started = Date.now();
      const data = await sendChatMessage(q, { lastTopic });
      // Small natural pause so the typing indicator doesn't just flash.
      const wait = Math.max(0, 500 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      setMessages((m) => [...m, { from: 'agent', text: data.reply }]);
      setLastTopic(data.topic || null);
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch (err) {
      // Show the server's own message for limits/validation; a generic one for network failures.
      const text = err.status
        ? `${err.message} You can also reach Rupesh at ${profile.email}.`
        : `Sorry, I couldn't reach my server just now. Please try again in a moment — or contact Rupesh directly at ${profile.email}.`;
      setMessages((m) => [...m, { from: 'agent', text, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        className={`agent-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close chat' : 'Chat with my AI assistant'}
        aria-expanded={open}
      >
        {!open && <span className="agent-fab-ring" />}
        <span aria-hidden>{open ? '✕' : '◈'}</span>
        {!open && <span className="agent-fab-label">Ask my AI agent</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="agent-panel"
            role="dialog"
            aria-label="Chat with Rupesh's AI assistant"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <div className="agent-head">
              <span className="agent-avatar">◈</span>
              <div className="agent-head-text">
                <b>Rupesh.agent</b>
                <small>
                  <i className="online-dot" /> online · answers from his résumé & projects
                </small>
              </div>
              {messages.length > 1 && (
                <button className="agent-new" onClick={newChat} aria-label="Start a new chat" title="New chat">
                  ↺
                </button>
              )}
              <button className="agent-close" onClick={() => setOpen(false)} aria-label="Close chat">
                ✕
              </button>
            </div>

            <div className="agent-body" ref={bodyRef} aria-live="polite">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`bubble bubble-${m.from} ${m.error ? 'bubble-error' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {m.from === 'agent' ? <Linkified text={m.text} /> : m.text}
                </motion.div>
              ))}
              {busy && (
                <div className="bubble bubble-agent typing" aria-label="Assistant is typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <div className="agent-suggest">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={busy}>
                  {s}
                </button>
              ))}
            </div>

            <form
              className="agent-input"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skills, projects, education…"
                maxLength={500}
                enterKeyHint="send"
                aria-label="Your question"
              />
              <button disabled={busy || !input.trim()} aria-label="Send">
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
