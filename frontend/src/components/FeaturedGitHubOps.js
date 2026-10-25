'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from './Reveal';
import { FeaturedCopy } from './FeaturedProject';
import { githubOpsProject as p } from '@/data/profile';

// Looping demo of the product: the user types a request, the agent calls a GitHub tool,
// and anything that writes waits for a human (or admin) to approve it.
const SCENES = [
  {
    prompt: 'List my repositories',
    tool: 'get_repositories',
    rows: [
      ['octo/api', 'Private'],
      ['octo/web', 'Public'],
      ['octo/docs', 'Public'],
    ],
  },
  {
    prompt: 'Open an issue on octo/web: "Login redirect loops"',
    tool: 'create_issue',
    gate: 'user',
    ask: 'Create issue in octo/web?',
    result: 'Approved · issue #42 opened',
  },
  {
    prompt: 'Delete branch old-ui on octo/api',
    tool: 'delete_branch',
    gate: 'admin',
    ask: 'Risky action · sent to admin review',
    result: 'Admin approved · branch deleted',
  },
  {
    prompt: 'Re-run the failed CI on octo/web',
    tool: 'rerun_workflow',
    gate: 'user',
    ask: 'Re-run workflow "CI" on octo/web?',
    result: 'Approved · run #318 queued',
  },
];

const NAV = ['Assistant', 'Repositories', 'Audit log', 'Admin'];

// Phases of one scene: typing → thinking → reply (→ approved) → next scene.
const HOLD = { thinking: 800, reply: 1500, approved: 1900 };

export default function FeaturedGitHubOps() {
  const [s, setS] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [audit, setAudit] = useState(27);

  const scene = SCENES[s];

  useEffect(() => {
    let t;
    if (phase === 'typing') {
      t =
        typed < scene.prompt.length
          ? setTimeout(() => setTyped((n) => n + 1), 38)
          : setTimeout(() => setPhase('thinking'), 350);
    } else if (phase === 'thinking') {
      t = setTimeout(() => setPhase('reply'), HOLD.thinking);
    } else if (phase === 'reply') {
      t = setTimeout(() => {
        if (scene.gate) {
          setPhase('approved');
          setAudit((n) => n + 1);
        } else {
          next();
        }
      }, scene.gate ? HOLD.reply : HOLD.approved + 600);
    } else if (phase === 'approved') {
      t = setTimeout(next, HOLD.approved);
    }
    return () => clearTimeout(t);

    function next() {
      setS((n) => (n + 1) % SCENES.length);
      setTyped(0);
      setPhase('typing');
    }
  }, [phase, typed, scene]);

  const activeNav = scene.gate === 'admin' && phase !== 'typing' ? 'Admin' : 'Assistant';
  const sent = phase !== 'typing';

  return (
    <Reveal className="featured featured--rose">
      <div className="featured-glow" aria-hidden />
      <FeaturedCopy p={p} icon="⑂" liveBadge="Live demo · no sign-in" ctaLabel="Try the live demo" />

      <div className="featured-visual" aria-hidden>
        <div className="shield-window gho-window">
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title mono">githubops-ai.vercel.app/chat</span>
            <span className="gho-hitl mono">● HITL on</span>
          </div>

          <div className="gho-app">
            <nav className="gho-nav">
              {NAV.map((n) => (
                <span key={n} className={n === activeNav ? 'is-active' : ''}>
                  {n}
                  {n === 'Audit log' && <em className="mono">{audit}</em>}
                </span>
              ))}
            </nav>

            <div className="gho-chat">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s}
                  className="gho-thread"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {sent && (
                    <motion.div className="gho-user" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      {scene.prompt}
                    </motion.div>
                  )}

                  {phase === 'thinking' && (
                    <div className="gho-bot gho-typing">
                      <i />
                      <i />
                      <i />
                    </div>
                  )}

                  {(phase === 'reply' || phase === 'approved') && (
                    <motion.div
                      className="gho-bot"
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    >
                      {scene.rows ? (
                        <>
                          <p>You have {scene.rows.length} repositories:</p>
                          <ul className="gho-rows mono">
                            {scene.rows.map(([name, vis]) => (
                              <li key={name}>
                                {name} <b className={vis === 'Private' ? 'is-private' : ''}>{vis}</b>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div className={`gho-gate gho-gate--${scene.gate}`}>
                          <p>{scene.ask}</p>
                          <AnimatePresence mode="wait">
                            {phase === 'approved' ? (
                              <motion.b
                                key="ok"
                                className="gho-ok"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                ✓ {scene.result}
                              </motion.b>
                            ) : (
                              <motion.div key="btns" className="gho-btns" exit={{ opacity: 0 }}>
                                <span className="gho-approve">{scene.gate === 'admin' ? 'Awaiting admin…' : 'Approve'}</span>
                                <span className="gho-reject">Reject</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      <span className="gho-tool mono">{scene.tool}</span>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="gho-input">
                <span className={sent ? 'gho-placeholder' : ''}>
                  {sent ? 'Ask about your GitHub…' : scene.prompt.slice(0, typed)}
                  {!sent && <i className="gho-caret" />}
                </span>
                <b>→</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
