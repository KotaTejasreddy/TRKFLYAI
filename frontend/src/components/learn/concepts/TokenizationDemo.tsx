"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Tok { t: string; id: number; }
interface Example { word: string; tokens: Tok[]; }

const EXAMPLES: Example[] = [
  { word: "Unbelievable",  tokens: [{ t: "Un",     id: 1428 },  { t: "believ",   id: 29391 }, { t: "able",     id: 481  }] },
  { word: "Tokenization",  tokens: [{ t: "Token",  id: 11138 }, { t: "ization",  id: 2065  }] },
  { word: "Transformer",   tokens: [{ t: "Trans",  id: 8163  }, { t: "former",   id: 11354 }] },
  { word: "International", tokens: [{ t: "Inter",  id: 9054  }, { t: "national", id: 2784  }] },
];

// Vibrant accent palette — each chip in a sequence gets a distinct hue.
const PALETTE = [
  { name: "cyan",    bg: "rgba(34,211,238,0.10)",  bd: "rgba(34,211,238,0.55)",  glow: "rgba(34,211,238,0.40)",  text: "#67e8f9" },
  { name: "pink",    bg: "rgba(236,72,153,0.10)",  bd: "rgba(236,72,153,0.55)",  glow: "rgba(236,72,153,0.40)",  text: "#fbcfe8" },
  { name: "emerald", bg: "rgba(16,185,129,0.10)",  bd: "rgba(16,185,129,0.55)",  glow: "rgba(16,185,129,0.40)",  text: "#a7f3d0" },
  { name: "amber",   bg: "rgba(245,158,11,0.10)",  bd: "rgba(245,158,11,0.55)",  glow: "rgba(245,158,11,0.40)",  text: "#fde68a" },
  { name: "violet",  bg: "rgba(168,85,247,0.10)",  bd: "rgba(168,85,247,0.55)",  glow: "rgba(168,85,247,0.40)",  text: "#e9d5ff" },
];

export default function TokenizationDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % EXAMPLES.length), 4800);
    return () => clearInterval(t);
  }, []);
  const ex = EXAMPLES[idx];

  return (
    <div className="space-y-7">
      {/* Word breakdown */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {ex.tokens.map((tok, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <motion.div
              key={`${ex.word}-${i}`}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 py-3 rounded-xl font-mono text-base sm:text-lg font-bold"
              style={{
                background: c.bg,
                border: `1px solid ${c.bd}`,
                color: c.text,
                boxShadow: `0 0 22px ${c.glow}, inset 0 0 8px ${c.bg}`,
              }}
            >
              {tok.t}
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: ex.tokens.length * 0.12 + 0.1 }}
          className="px-3 py-3 font-mono text-2xl"
          style={{
            background: "linear-gradient(135deg, #67e8f9, #fbcfe8, #fde68a, #e9d5ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          =
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: ex.tokens.length * 0.12 + 0.2 }}
          className="px-5 py-3 rounded-xl font-mono text-base sm:text-lg font-bold relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.14))",
            border: "1px solid rgba(168,85,247,0.55)",
            color: "#f5d0fe",
            boxShadow: "0 0 28px rgba(168,85,247,0.40), 0 0 56px rgba(236,72,153,0.20)",
          }}
        >
          {ex.tokens.length} tokens
        </motion.div>
      </div>

      {/* Token ID cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ex.tokens.map((tok, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <motion.div
              key={`id-${ex.word}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -2 }}
              className="relative rounded-xl p-4 overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.98))",
                border: `1px solid ${c.bd}`,
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40"
                style={{ background: c.glow }}
              />
              <div className="relative">
                <div className="text-[10px] font-mono tracking-[0.25em] mb-2 uppercase"
                  style={{ color: c.text, opacity: 0.85 }}>
                  Token ID
                </div>
                <div className="font-mono text-sm sm:text-base">
                  <span style={{ color: c.text }}>{tok.t}</span>
                  <span style={{ color: "rgba(148,163,184,0.6)" }}> {" → "} </span>
                  <span style={{ color: "#f5d0fe" }}>{tok.id}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs sm:text-sm pt-2" style={{ color: "rgba(148,163,184,0.7)" }}>
        Every model has its own vocabulary (~50k tokens for GPT-2, ~200k for GPT-4o).
        Rare words split into common sub-pieces.
      </p>
    </div>
  );
}
