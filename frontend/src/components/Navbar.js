'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#top" className="nav-logo" aria-label="Back to top">
        <span className="nav-logo-mark">RK</span>
        <span className="nav-logo-dot" />
      </a>

      <nav className={`nav-links ${open ? 'nav-links--open' : ''}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)} className={active === l.id ? 'is-active' : ''}>
            {active === l.id && <motion.span layoutId="nav-pill" className="nav-pill" />}
            <span>{l.label}</span>
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          className="kbd-hint"
          onClick={() => window.dispatchEvent(new CustomEvent('open-palette'))}
          aria-label="Open command palette"
        >
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </button>
        <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <span />
          <span />
        </button>
      </div>
    </motion.header>
  );
}
