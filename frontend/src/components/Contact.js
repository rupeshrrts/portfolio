'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import Magnetic from './Magnetic';
import { profile } from '@/data/profile';
import { api } from '@/lib/api';

const EMPTY = { name: '', email: '', subject: '', message: '' };

const OPEN_TO = [
  { icon: '💼', title: 'Full-time roles', text: 'Generative AI, Agentic AI and full-stack engineering — Python, Node.js, React, Java / Spring Boot' },
  { icon: '🤝', title: 'Collaboration', text: 'Building or contributing to AI, MCP and RAG projects' },
  { icon: '💬', title: 'Tech conversations', text: 'Agents, LLMs, cloud and software architecture' },
];

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', msg: '' });
  const [copied, setCopied] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', msg: '' });
    try {
      const res = await api('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      setStatus({ state: 'success', msg: res.message });
      setForm(EMPTY);
    } catch (err) {
      setStatus({
        state: 'error',
        msg: err.message === 'Failed to fetch' ? `Couldn't reach the server — email me directly at ${profile.email}.` : err.message,
      });
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionTitle index="06" kicker="contact" title="Let's work" accent="together." />

        <div className="contact-grid">
          <Reveal className="contact-info">
            <p className="contact-lead">
              I&apos;m always happy to connect — whether you&apos;re a recruiter, a team lead, or a fellow engineer.
              Drop me a message and I&apos;ll get back to you soon.
            </p>

            <ul className="open-to">
              {OPEN_TO.map((o) => (
                <li key={o.title}>
                  <span className="open-to-icon" aria-hidden>
                    {o.icon}
                  </span>
                  <span>
                    <b>{o.title}</b>
                    <small className="muted">{o.text}</small>
                  </span>
                </li>
              ))}
            </ul>

            <button className="contact-row" onClick={copyEmail}>
              <span className="contact-icon">✉</span>
              <span>
                <small className="muted">Email · click to copy</small>
                <b>{copied ? 'Copied to clipboard ✓' : profile.email}</b>
              </span>
            </button>
            {profile.linkedin && (
              <a className="contact-row" href={profile.linkedin} target="_blank" rel="noreferrer">
                <span className="contact-icon">in</span>
                <span>
                  <small className="muted">LinkedIn</small>
                  <b>Connect with me ↗</b>
                </span>
              </a>
            )}
            <a className="contact-row" href={profile.github} target="_blank" rel="noreferrer">
              <span className="contact-icon">⌥</span>
              <span>
                <small className="muted">GitHub</small>
                <b>github.com/rupeshrrts ↗</b>
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.1} className="card contact-form-card">
            <form onSubmit={submit} className="contact-form">
              <div className="field-row">
                <Field label="Your name" value={form.name} onChange={update('name')} required minLength={2} />
                <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
              </div>
              <Field label="Subject (optional)" value={form.subject} onChange={update('subject')} />
              <Field label="Message" textarea value={form.message} onChange={update('message')} required minLength={10} />

              <div className="form-footer">
                <Magnetic>
                  <button className="btn btn-primary" disabled={status.state === 'loading'}>
                    {status.state === 'loading' ? 'Sending…' : 'Send message'} <span aria-hidden>↗</span>
                  </button>
                </Magnetic>
                <AnimatePresence>
                  {status.msg && (
                    <motion.p
                      key={status.msg}
                      className={`form-status form-status--${status.state}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {status.msg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, textarea, ...props }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label className="field">
      <Tag {...props} placeholder=" " rows={textarea ? 5 : undefined} />
      <span>{label}</span>
    </label>
  );
}
