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
    focusIdx: 4,
    tokens: [
      { word: "She",      weight: 0.30 },
      { word: "deposited",weight: 0.92 },
      { word: "her",      weight: 0.20 },
      { word: "salary",   weight: 0.80 },
      { word: "in",       weight: 0.10 },
      { word: "the",      weight: 0.05 },
      { word: "bank",     weight: 1.00 },
    ],
    explanation: "Here 'deposited' and 'salary' dominate attention — same word, completely different meaning.",
  },
];

export default function AttentionDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SENTENCES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const s = SENTENCES[idx];

  return (
    <div className="space-y-5">
      {/* Sentence with weighted tokens */}
      <div className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
          border: "1px solid rgba(34,211,238,0.16)",
        }}>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-4"
          style={{ color: "rgba(103,232,249,0.6)" }}>
          MODEL ASKS: which words explain &ldquo;
          <span style={{ color: "#f5d0fe" }}>{s.tokens[s.focusIdx].word}</span>
          &rdquo;?
        </div>

        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          {s.tokens.map((t, i) => {
            const isFocus = i === s.focusIdx;
            const intensity = t.weight;
            const fontSize = 14 + intensity * 12;
            const opacity = 0.35 + intensity * 0.65;
            const fontWeight = intensity > 0.6 ? 800 : intensity > 0.3 ? 600 : 400;
            return (
              <motion.span
                key={`${idx}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight,
                  color: isFocus ? "#f5d0fe" : intensity > 0.55 ? "#67e8f9" : "rgba(226,232,240,0.78)",
                  textShadow: intensity > 0.6 ? `0 0 ${10 + intensity * 18}px rgba(34,211,238,0.5)` : "none",
                  borderBottom: isFocus ? "2px solid rgba(168,85,247,0.7)" : "none",
                  paddingBottom: isFocus ? "2px" : 0,
                }}
              >
                {t.word}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Weight bars */}
      <div className="rounded-2xl p-5"
        style={{
          background: "rgba(2,6,23,0.55)",
          border: "1px solid rgba(34,211,238,0.10)",
        }}>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-3"
          style={{ color: "rgba(103,232,249,0.6)" }}>
          ATTENTION WEIGHTS
        </div>
        <div className="space-y-1.5">
          {s.tokens.map((t, i) => (
            <div key={`bar-${idx}-${i}`} className="flex items-center gap-3 text-xs">
              <span className="font-mono w-20 sm:w-24 truncate" style={{ color: "rgba(226,232,240,0.8)" }}>
                {t.word}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(34,211,238,0.08)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.weight * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: i === s.focusIdx
                      ? "linear-gradient(90deg, #a855f7, #f5d0fe)"
                      : "linear-gradient(90deg, #22d3ee, #67e8f9)",
                  }}
                />
              </div>
              <span className="font-mono w-10 text-right" style={{ color: "rgba(165,243,252,0.7)" }}>
                {t.weight.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.p
        key={`exp-${idx}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm sm:text-base leading-relaxed pt-2"
        style={{ color: "rgba(226,232,240,0.85)" }}>
        💡 {s.explanation}
      </motion.p>
    </div>
  );
}
