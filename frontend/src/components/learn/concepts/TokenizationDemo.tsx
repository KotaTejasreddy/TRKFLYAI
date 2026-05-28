"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const EXAMPLES = [
  { word: "Unbelievable", tokens: [{ t: "Un", id: 1428 }, { t: "believ", id: 29391 }, { t: "able", id: 481 }] },
  { word: "Tokenization", tokens: [{ t: "Token", id: 11138 }, { t: "ization", id: 2065 }] },
  { word: "Transformer", tokens: [{ t: "Trans", id: 8163 }, { t: "former", id: 11354 }] },
  { word: "International", tokens: [{ t: "Inter", id: 9054 }, { t: "national", id: 2784 }] },
];

export default function TokenizationDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % EXAMPLES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const ex = EXAMPLES[idx];

  return (
    <div className="space-y-6">
      {/* Word breakdown */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {ex.tokens.map((tok, i) => (
          <motion.div
            key={`${ex.word}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="px-5 py-3 rounded-xl font-mono text-base sm:text-lg font-bold"
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.35)",
              color: "#e0f2fe",
              boxShadow: "0 0 16px rgba(34,211,238,0.10)",
            }}
          >
            {tok.t}
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: ex.tokens.length * 0.12 + 0.1 }}
          className="px-3 py-3 font-mono text-base sm:text-lg"
          style={{ color: "rgba(165,243,252,0.6)" }}
        >
          =
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: ex.tokens.length * 0.12 + 0.2 }}
          className="px-5 py-3 rounded-xl font-mono text-base sm:text-lg font-bold"
          style={{
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.40)",
            color: "#f5d0fe",
            boxShadow: "0 0 20px rgba(168,85,247,0.18)",
          }}
        >
          {ex.tokens.length} tokens
        </motion.div>
      </div>

      {/* Token ID cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ex.tokens.map((tok, i) => (
          <motion.div
            key={`id-${ex.word}-${i}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
              border: "1px solid rgba(34,211,238,0.20)",
            }}
          >
            <div className="text-[10px] font-mono tracking-[0.25em] mb-2 uppercase"
              style={{ color: "rgba(103,232,249,0.55)" }}>
              Token ID
            </div>
            <div className="font-mono text-sm sm:text-base">
              <span style={{ color: "#67e8f9" }}>{tok.t}</span>
              <span style={{ color: "rgba(148,163,184,0.7)" }}> {" → "} </span>
              <span style={{ color: "#f5d0fe" }}>{tok.id}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs sm:text-sm pt-2" style={{ color: "rgba(148,163,184,0.7)" }}>
        Every model has its own vocabulary (~50k tokens for GPT-2, ~100k for GPT-4o).
        Rare words split into common sub-pieces.
      </p>
    </div>
  );
}
