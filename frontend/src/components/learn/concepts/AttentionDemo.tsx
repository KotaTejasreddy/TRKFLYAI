"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Sentence { tokens: { word: string; weight: number }[]; focusIdx: number; explanation: string; }

const SENTENCES: Sentence[] = [
  {
    focusIdx: 3,
    tokens: [
      { word: "The",    weight: 0.05 },
      { word: "river",  weight: 0.85 },
      { word: "is",     weight: 0.10 },
      { word: "bank",   weight: 1.00 },
      { word: "was",    weight: 0.20 },
      { word: "steep",  weight: 0.75 },
      { word: "and",    weight: 0.08 },
      { word: "muddy",  weight: 0.55 },
    ],
    explanation: "Because 'river' and 'steep' light up, the model decides 'bank' means a riverbank — not a financial bank.",
  },
  {
    focusIdx: 6,
    tokens: [
      { word: "She",       weight: 0.30 },
      { word: "deposited", weight: 0.92 },
      { word: "her",       weight: 0.20 },
      { word: "salary",    weight: 0.80 },
      { word: "in",        weight: 0.10 },
      { word: "the",       weight: 0.05 },
      { word: "bank",      weight: 1.00 },
    ],
    explanation: "Here 'deposited' and 'salary' dominate attention — same word, completely different meaning.",
  },
  {
    focusIdx: 2,
    tokens: [
      { word: "The",     weight: 0.05 },
      { word: "golden",  weight: 0.78 },
      { word: "apple",   weight: 1.00 },
      { word: "fell",    weight: 0.45 },
      { word: "from",    weight: 0.10 },
      { word: "Newton's",weight: 0.88 },
      { word: "tree",    weight: 0.65 },
    ],
    explanation: "'Newton's' and 'golden' pull 'apple' toward the physics story, not the fruit basket.",
  },
];

/** Heatmap from cool blue → cyan → green → amber → hot pink. */
function heatColor(w: number): { bg: string; bd: string; text: string; glow: string } {
  if (w >= 0.85) return { bg: "rgba(236,72,153,0.18)",  bd: "rgba(236,72,153,0.7)",  text: "#fbcfe8", glow: "rgba(236,72,153,0.55)" };
  if (w >= 0.65) return { bg: "rgba(245,158,11,0.16)",  bd: "rgba(245,158,11,0.6)",  text: "#fde68a", glow: "rgba(245,158,11,0.45)" };
  if (w >= 0.45) return { bg: "rgba(16,185,129,0.14)",  bd: "rgba(16,185,129,0.55)", text: "#a7f3d0", glow: "rgba(16,185,129,0.35)" };
  if (w >= 0.25) return { bg: "rgba(34,211,238,0.10)",  bd: "rgba(34,211,238,0.45)", text: "#67e8f9", glow: "rgba(34,211,238,0.25)" };
  return            { bg: "rgba(99,102,241,0.06)",  bd: "rgba(99,102,241,0.25)", text: "rgba(199,210,254,0.55)", glow: "rgba(99,102,241,0.10)" };
}

export default function AttentionDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SENTENCES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const s = SENTENCES[idx];

  return (
    <div className="space-y-5">
      {/* Sentence with weighted token cards */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 20% 0%, rgba(168,85,247,0.10), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(236,72,153,0.10), transparent 60%), linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.98))",
          border: "1px solid rgba(103,232,249,0.16)",
        }}>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-5"
          style={{ color: "rgba(103,232,249,0.7)" }}>
          MODEL ASKS: which words explain &ldquo;
          <span style={{ color: "#fbcfe8" }}>{s.tokens[s.focusIdx].word}</span>
          &rdquo;?
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {s.tokens.map((t, i) => {
            const isFocus = i === s.focusIdx;
            const c = heatColor(t.weight);
            return (
              <motion.div
                key={`${idx}-${i}`}
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold"
                style={{
                  background: c.bg,
                  border: isFocus ? `1.5px solid rgba(168,85,247,0.85)` : `1px solid ${c.bd}`,
                  color: c.text,
                  fontSize: `${13 + t.weight * 6}px`,
                  boxShadow: `0 0 ${t.weight * 24}px ${c.glow}`,
                  textShadow: t.weight > 0.55 ? `0 0 ${10 + t.weight * 14}px ${c.glow}` : "none",
                }}>
                {t.word}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weight bars */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
          border: "1px solid rgba(34,211,238,0.10)",
        }}>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-3"
          style={{ color: "rgba(103,232,249,0.6)" }}>
          ATTENTION WEIGHTS
        </div>
        <div className="space-y-1.5">
          {s.tokens.map((t, i) => {
            const isFocus = i === s.focusIdx;
            const c = heatColor(t.weight);
            return (
              <div key={`bar-${idx}-${i}`} className="flex items-center gap-3 text-xs">
                <span className="font-mono w-20 sm:w-24 truncate" style={{ color: "rgba(226,232,240,0.8)" }}>
                  {t.word}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden relative"
                  style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(34,211,238,0.08)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.weight * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{
                      background: isFocus
                        ? "linear-gradient(90deg, #a855f7, #ec4899, #fbcfe8)"
                        : t.weight >= 0.65
                          ? "linear-gradient(90deg, #f59e0b, #ec4899)"
                          : t.weight >= 0.45
                            ? "linear-gradient(90deg, #10b981, #f59e0b)"
                            : "linear-gradient(90deg, #22d3ee, #10b981)",
                      boxShadow: `0 0 12px ${c.glow}`,
                    }}
                  />
                </div>
                <span className="font-mono w-10 text-right" style={{ color: c.text }}>
                  {t.weight.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Heatmap legend */}
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider"
          style={{ color: "rgba(148,163,184,0.6)" }}>
          <span>low</span>
          <div className="flex-1 h-1.5 rounded-full"
            style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.4), #22d3ee, #10b981, #f59e0b, #ec4899)" }} />
          <span>high</span>
        </div>
      </div>

      <motion.p
        key={`exp-${idx}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm sm:text-base leading-relaxed pt-2"
        style={{ color: "rgba(226,232,240,0.88)" }}>
        💡 {s.explanation}
      </motion.p>
    </div>
  );
}
