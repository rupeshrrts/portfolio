'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NeuralCanvas from './NeuralCanvas';
import AgentTerminal from './AgentTerminal';
import Magnetic from './Magnetic';
import { profile } from '@/data/profile';

function useTypewriter(words) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    const done = !deleting && text === word;
    const empty = deleting && text === '';
    const delay = done ? 1600 : deleting ? 40 : 85;
    const t = setTimeout(() => {
      if (done) return setDeleting(true);
      if (empty) {
        setDeleting(false);
        return setIndex((i) => i + 1);
      }
      setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index, words]);

  return text;
}

const letter = {
  hidden: { y: '110%', opacity: 0 },
  show: (i) => ({ y: '0%', opacity: 1, transition: { delay: 0.35 + i * 0.045, duration: 0.8, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  const role = useTypewriter(profile.roles);
  const [first, last] = profile.name.split(' ');

  return (
    <section id="top" className="hero">
      <NeuralCanvas />
      <div className="container hero-inner">
        <div className="hero-copy">
          <motion.div
            className="status-pill"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="pulse" /> Joining Digital India Corporation, MeitY as Full Stack Developer
          </motion.div>

          <h1 className="hero-name" aria-label={profile.name}>
            {[first, last].map((word, wi) => (
              <span key={word} className={`hero-word ${wi === 1 ? 'gradient-text' : ''}`}>
                {word.split('').map((ch, i) => (
                  <span key={i} className="hero-letter-mask">
                    <motion.span
                      className="hero-letter"
                      custom={i + wi * first.length}
                      variants={letter}
                      initial="hidden"
                      animate="show"
                    >
                      {ch}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            className="hero-role mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="muted">&gt;</span> {role}
            <span className="caret" />
          </motion.p>

          <motion.p
            className="hero-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            I build AI agents that <em>actually do things</em> — MCP tools, RAG pipelines and tool-calling chatbots
            wired into real enterprise systems, on top of 2+ years of full-stack engineering with Java, Spring Boot and React.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.8 }}
          >
            <Magnetic>
              <a href="#projects" className="btn btn-primary">
                Explore my work <span aria-hidden>→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href={profile.resume} className="btn btn-ghost" download>
                Download résumé <span aria-hidden>↓</span>
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            className="hero-socials"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.45 }}
          >
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
            <a href={`mailto:${profile.email}`}>Email ↗</a>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92, rotateX: 12 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ delay: 0.8, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-orbit" aria-hidden>
            <span className="orbit-chip" style={{ '--a': '0deg' }}>MCP</span>
            <span className="orbit-chip" style={{ '--a': '72deg' }}>RAG</span>
            <span className="orbit-chip" style={{ '--a': '144deg' }}>Spring Boot</span>
            <span className="orbit-chip" style={{ '--a': '216deg' }}>LLMs</span>
            <span className="orbit-chip" style={{ '--a': '288deg' }}>Agents</span>
          </div>
          <AgentTerminal />
        </motion.div>
      </div>

      <a href="#about" className="scroll-cue" aria-label="Scroll to about">
        <span />
      </a>
    </section>
  );
}
