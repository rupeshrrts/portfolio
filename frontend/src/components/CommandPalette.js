'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile, featuredProject } from '@/data/profile';
import { NAV_LINKS } from './Navbar';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(
    () => [
      ...NAV_LINKS.map((l) => ({ label: `Go to ${l.label}`, hint: 'section', run: () => jump(l.id) })),
      { label: 'Chat with my AI agent', hint: 'action', run: () => window.dispatchEvent(new CustomEvent('open-agent')) },
      { label: 'Download résumé', hint: 'action', run: () => window.open(profile.resume, '_blank') },
      { label: 'Copy email address', hint: 'action', run: () => navigator.clipboard?.writeText(profile.email) },
      { label: 'Open AgentShieldAI (live)', hint: 'link', run: () => window.open(featuredProject.live, '_blank') },
      { label: 'Open GitHub', hint: 'link', run: () => window.open(profile.github, '_blank') },
      ...(profile.linkedin
        ? [{ label: 'Open LinkedIn', hint: 'link', run: () => window.open(profile.linkedin, '_blank') }]
        : []),
      { label: 'Back to top', hint: 'section', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ],
    [],
  );

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const execute = (cmd) => {
    setOpen(false);
    cmd?.run();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      execute(filtered[cursor]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="palette"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Type a command or search…"
            />
            <ul>
              {filtered.map((c, i) => (
                <li
                  key={c.label}
                  className={i === cursor ? 'is-active' : ''}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => execute(c)}
                >
                  <span>{c.label}</span>
                  <small className="mono">{c.hint}</small>
                </li>
              ))}
              {filtered.length === 0 && <li className="muted">No results</li>}
            </ul>
            <div className="palette-foot mono">↑↓ navigate · ↵ select · esc close</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function jump(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
