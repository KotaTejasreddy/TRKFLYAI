"use client";

/**
 * LearnBrainBackground — the cinematic brain hero re-purposed as a fixed,
 * full-viewport BACKGROUND for the entire /learn/* surface.
 *
 * Differences from MindOfLLMHero:
 *   - No foreground text / CTAs (pure visual layer)
 *   - fixed-position so it stays put while content scrolls
 *   - pointer-events: none — clicks pass through to the real content
 *   - Reduced overall opacity so it never competes with foreground UI
 *   - Brain slightly smaller + softer for ambient feel
 */

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import AuroraBg from "./AuroraBg";

const TOKENS = [
  { text: "tokenize",  angle: 0,   radius: 220, color: "cyan"   },
  { text: "embed",     angle: 45,  radius: 260, color: "violet" },
  { text: "attention", angle: 90,  radius: 230, color: "cyan"   },
  { text: "Q · K · V", angle: 135, radius: 270, color: "violet" },
  { text: "softmax",   angle: 180, radius: 220, color: "cyan"   },
  { text: "logits",    angle: 225, radius: 265, color: "violet" },
  { text: "decode",    angle: 270, radius: 230, color: "cyan"   },
  { text: "predict",   angle: 315, radius: 260, color: "violet" },
];

const NEURAL_NODES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { id: i, x: Math.cos(a) * 100, y: Math.sin(a) * 100, delay: i * 0.08 };
});
const NEURAL_EDGES: [number, number][] = [
  [0, 5], [0, 9], [1, 6], [1, 10], [2, 7], [2, 11], [3, 8], [3, 12],
  [4, 9], [4, 13], [5, 10], [6, 11], [7, 12], [8, 13], [9, 0], [10, 2],
];

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 40;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.35 + 0.12),
      hue: Math.random() < 0.5 ? 185 : 270,
      a: Math.random() * 0.4 + 0.15,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.a})`);
        g.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ opacity: 0.55 }} />;
}

export default function LearnBrainBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* 1 · Aurora colour wash */}
      <AuroraBg />

      {/* 2 · Drifting particles */}
      <div className="absolute inset-0" style={{ opacity: 0.55 }}>
        <ParticleField />
      </div>

      {/* 3 · Brain centerpiece — at reduced opacity for backdrop feel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0.45 }}>
        <svg width={480} height={480} viewBox="-240 -240 480 480" className="block">
          <defs>
            <radialGradient id="bgCoreGlow">
              <stop offset="0%"   stopColor="#67e8f9" stopOpacity={1} />
              <stop offset="35%"  stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="70%"  stopColor="#a855f7" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="bgNodeGlow">
              <stop offset="0%"   stopColor="#a5f3fc" stopOpacity={1} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="bgRingStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#22d3ee" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
            </linearGradient>
            <filter id="bgGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Concentric rings */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            <circle r={220} fill="none" stroke="url(#bgRingStroke)" strokeWidth={0.7} strokeDasharray="3 8" />
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
            <circle r={175} fill="none" stroke="url(#bgRingStroke)" strokeWidth={0.8} strokeDasharray="2 4" />
          </motion.g>
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            <circle r={138} fill="none" stroke="url(#bgRingStroke)" strokeWidth={1.2} strokeOpacity={0.8} />
          </motion.g>

          {/* Neural edges */}
          {NEURAL_EDGES.map(([a, b], i) => {
            const A = NEURAL_NODES[a];
            const B = NEURAL_NODES[b];
            return (
              <motion.line
                key={i}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke="rgba(34,211,238,0.45)" strokeWidth={0.6}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 4, delay: i * 0.15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              />
            );
          })}

          {/* Neural nodes */}
          {NEURAL_NODES.map((n) => (
            <motion.g key={n.id}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2.4, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}>
              <circle cx={n.x} cy={n.y} r={6} fill="url(#bgNodeGlow)" />
              <circle cx={n.x} cy={n.y} r={2} fill="#a5f3fc" filter="url(#bgGlow)" />
            </motion.g>
          ))}

          {/* Pulsing core */}
          <motion.circle r={80} fill="url(#bgCoreGlow)"
            animate={{ r: [75, 85, 75], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#bgGlow)" />
          <circle r={36} fill="rgba(168,85,247,0.6)" filter="url(#bgGlow)" />
          <circle r={18} fill="#f5d0fe" filter="url(#bgGlow)" />
        </svg>
      </div>

      {/* 4 · Orbiting tokens (very subtle) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0.35 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      >
        {TOKENS.map((t, i) => {
          const rad = (t.angle * Math.PI) / 180;
          const x = Math.cos(rad) * t.radius;
          const y = Math.sin(rad) * t.radius;
          const isCyan = t.color === "cyan";
          return (
            <motion.div
              key={t.text}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
              animate={{ rotate: -360, y: [y - 4, y + 4, y - 4] }}
              transition={{
                rotate: { duration: 110, repeat: Infinity, ease: "linear" },
                y: { duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
              }}
            >
              <div
                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap"
                style={{
                  background: isCyan
                    ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))"
                    : "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(168,85,247,0.05))",
                  border: `1px solid ${isCyan ? "rgba(6,182,212,0.35)" : "rgba(168,85,247,0.35)"}`,
                  color: isCyan ? "#a5f3fc" : "#e9d5ff",
                  backdropFilter: "blur(8px)",
                  boxShadow: isCyan
                    ? "0 0 14px rgba(6,182,212,0.25)"
                    : "0 0 14px rgba(168,85,247,0.25)",
                }}
              >
                {t.text}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 5 · Final vignette so foreground content has good contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(2,2,10,0.45) 70%, rgba(2,2,10,0.75) 100%)",
        }}
      />
    </div>
  );
}
