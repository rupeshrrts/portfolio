'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Reveal from './Reveal';
import { FeaturedCopy } from './FeaturedProject';
import { popMyFlixProject as p } from '@/data/profile';

// Looping demo of the product: campaigns go out to every channel, payments land,
// and the live analytics (requests, channel performance) update as it happens.
const EVENTS = [
  { icon: '▶', tone: 'launch', text: 'Campaign "Diwali Sale" launched on 4 channels', bars: [72, 54, 38, 22] },
  { icon: '₹', tone: 'pay', text: 'Payment received · ₹4,999 Pro plan', bars: [78, 61, 44, 26] },
  { icon: '↑', tone: 'up', text: 'CTR up 18% on Meta · budget shifted', bars: [70, 86, 46, 28] },
];

const CHANNELS = ['Google Ads', 'Meta', 'YouTube', 'Email'];

function RequestCounter({ value }) {
  const mv = useMotionValue(value);
  const shown = useTransform(mv, (v) => Math.round(v).toLocaleString('en-IN'));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value, mv]);

  return <motion.b>{shown}</motion.b>;
}

export default function FeaturedPopMyFlix() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const event = EVENTS[tick % EVENTS.length];

  return (
    <Reveal className="featured featured--pink">
      <div className="featured-glow" aria-hidden />
      <FeaturedCopy p={p} icon="▶" liveBadge="1,000+ daily requests" ctaLabel="View on GitHub" />

      <div className="featured-visual" aria-hidden>
        <div className="shield-window pmf-window">
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title mono">popmyflix · campaigns</span>
            <span className="pmf-live mono">● Live</span>
          </div>

          <div className="pmf-stats">
            <div>
              <span className="mono">Requests today</span>
              <RequestCounter value={1000 + tick * 37} />
            </div>
            <div>
              <span className="mono">Channels</span>
              <b>4</b>
            </div>
            <div>
              <span className="mono">Payments</span>
              <b className="pmf-on">Live</b>
            </div>
          </div>

          <div className="pmf-channels">
            {CHANNELS.map((c, n) => (
              <div key={c} className="pmf-channel">
                <span>{c}</span>
                <div className="pmf-bar">
                  <motion.i
                    initial={false}
                    animate={{ width: `${event.bars[n]}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
                <em className="mono">{event.bars[n]}%</em>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tick}
              className={`pmf-event pmf-event--${event.tone}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <b>{event.icon}</b> {event.text}
            </motion.div>
          </AnimatePresence>

          <div className="shield-platforms">
            {CHANNELS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
