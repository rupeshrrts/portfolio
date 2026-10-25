'use client';
import { useEffect, useState } from 'react';

// A looping, simulated agent run that shows the kind of systems Rupesh builds.
const SCRIPT = [
  { t: 'user', text: 'Show me pending outbound orders for Mumbai DC' },
  { t: 'think', text: 'Planning → need warehouse data, calling MCP tool' },
  { t: 'tool', text: 'mcp.call("query_orders", { dc: "MUM", status: "pending" })' },
  { t: 'ok', text: '✓ 42 rows · 118ms · read-only scope' },
  { t: 'agent', text: '42 outbound orders are pending at Mumbai DC — 9 are past SLA. Want me to raise a ticket?' },
  { t: 'user', text: 'Yes, raise it as high priority' },
  { t: 'tool', text: 'tools.create_ticket({ priority: "high", ref: "MUM-SLA" })' },
  { t: 'ok', text: '✓ Ticket WMS-20481 created' },
];

export default function AgentTerminal() {
  const [lines, setLines] = useState([]);
  const [typed, setTyped] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= SCRIPT.length) {
      const reset = setTimeout(() => {
        setLines([]);
        setStep(0);
      }, 3500);
      return () => clearTimeout(reset);
    }
    const line = SCRIPT[step];
    let i = 0;
    const speed = line.t === 'user' ? 32 : line.t === 'agent' ? 14 : 10;
    const iv = setInterval(() => {
      i++;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) {
        clearInterval(iv);
        setTimeout(() => {
          setLines((l) => [...l, line]);
          setTyped('');
          setStep((s) => s + 1);
        }, line.t === 'user' ? 450 : 650);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [step]);

  const current = SCRIPT[step];
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot dot-r" />
        <span className="dot dot-y" />
        <span className="dot dot-g" />
        <span className="terminal-title mono">agent@rupesh — wms-assistant</span>
        <span className="terminal-live">
          <i /> live
        </span>
      </div>
      <div className="terminal-body mono">
        {lines.slice(-6).map((l, i) => (
          <TermLine key={`${step}-${i}`} line={l} />
        ))}
        {current && <TermLine line={{ ...current, text: typed }} cursor />}
      </div>
    </div>
  );
}

const PREFIX = { user: '❯', think: '◌', tool: 'ƒ', ok: ' ', agent: '◈' };

function TermLine({ line, cursor }) {
  return (
    <div className={`tl tl-${line.t}`}>
      <span className="tl-prefix">{PREFIX[line.t]}</span>
      <span>
        {line.text}
        {cursor && <span className="caret" />}
      </span>
    </div>
  );
}
