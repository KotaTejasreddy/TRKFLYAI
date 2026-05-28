"use client";

/**
 * "Inside the Mind of an LLM" — cinematic hero for LearnAI.
 *
 * Stack used: React + Framer Motion + Canvas + SVG (no Three.js — keeps bundle lean,
 * matches Apple/OpenAI/Vercel feel through layered animations instead of 3D).
 *
 * Layers (bottom → top):
 *   1. Deep base + animated CSS grid background
 *   2. Mouse-reactive radial spotlight (cyan + purple)
 *   3. Canvas particles drifting upward
 *   4. SVG brain (concentric rings + neural network + pulsing core)
 *   5. Orbiting glassmorphism token pills
 *   6. Centered title + typewriter sub-line + CTA
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

/* ───────── tokens orbiting the brain ───────── */
const TOKENS = [
  { text: "tokenize",  angle: 0,    radius: 240, color: "cyan"   },
  { text: "embed",     angle: 45,   radius: 280, color: "violet" },
  { text: "attention", angle: 90,   radius: 250, color: "cyan"   },
  { text: "Q · K · V", angle: 135,  radius: 290, color: "violet" },
  { text: "softmax",   angle: 180,  radius: 240, color: "cyan"   },
  { text: "logits",    angle: 225,  radius: 285, color: "violet" },
  { text: "decode",    angle: 270,  radius: 250, color: "cyan"   },
  { text: "predict",   angle: 315,  radius: 280, color: "violet" },
];

/* ───────── phrases for the typewriter sub-line ───────── */
const PHRASES = [
  "Predict the next token.",
  "Attention is all you need.",
  "From characters to consciousness.",
  "Compress the world. Generate it back.",
  "1.7 trillion parameters, one purpose.",
];

/* ───────── neural-network nodes inside the brain ───────── */
const NEURAL_NODES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return { id: i, x: Math.cos(angle) * 110, y: Math.sin(angle) * 110, delay: i * 0.08 };
});
const NEURAL_EDGES: [number, number][] = [
  [0, 5], [0, 9], [1, 6], [1, 10], [2, 7], [2, 11], [3, 8], [3, 12],
  [4, 9], [4, 13], [5, 10], [6, 11], [7, 12], [8, 13], [9, 0], [10, 2],
];

/* ───────── canvas particles ───────── */
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

    const W = () => canvas.width;
    const H = () => canvas.height;
    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.45 + 0.15),
      hue: Math.random() < 0.5 ? 185 : 270, // cyan or violet
      a: Math.random() * 0.5 + 0.2,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H() + 10; p.x = Math.random() * W(); }
        if (p.x < -10) p.x = W() + 10;
        if (p.x > W() + 10) p.x = -10;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.a})`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.55 }} />;
}

/* ───────── typewriter line ───────── */
function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[phraseIdx];
    if (!deleting && text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 45);
      return () => clearTimeout(t);
    }
    if (!deleting && text.length === full.length) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && text.length > 0) {
      const t = setTimeout(() => setText(full.slice(0, text.length - 1)), 22);
      return () => clearTimeout(t);
    }
    if (deleting && text.length === 0) {
      setDeleting(false);
      setPhraseIdx((p) => (p + 1) % PHRASES.length);
    }
  }, [text, deleting, phraseIdx]);

  return (
    <div className="text-base sm:text-lg md:text-xl font-mono tracking-wide" style={{ color: "rgb(165,180,252)" }}>
      <span className="text-cyan-400">&gt; </span>
      {text}
      <span className="inline-block w-[2px] h-[1em] align-middle bg-cyan-300 ml-0.5 animate-pulse" />
    </div>
  );
}

/* ───────── main hero ───────── */
export default function MindOfLLMHero({ onExplore }: { onExplore?: () => void }) {
  // (onExplore optional — defaults to scrolling)
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });

  // Spotlight CSS gradient values
  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);

  // Brain looks at cursor (small parallax)
  const brainX = useTransform(sx, (v) => (v - 0.5) * 24);
  const brainY = useTransform(sy, (v) => (v - 0.5) * 24);

  function handleMouse(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <section
      onMouseMove={handleMouse}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "92vh", background: "#05050a" }}
    >
      {/* 1 · Deep base + animated grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPositionX: ["0px", "60px"], backgroundPositionY: ["0px", "60px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* 2 · Mouse-reactive spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [lightX, lightY],
            ([x, y]) =>
              `radial-gradient(circle 500px at ${x} ${y}, rgba(6,182,212,0.16), transparent 70%), radial-gradient(circle 800px at ${x} ${y}, rgba(139,92,246,0.10), transparent 70%)`,
          ),
        }}
      />

      {/* 3 · Canvas particles */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* 4 · Brain */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ x: brainX, y: brainY }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg width={520} height={520} viewBox="-260 -260 520 520" className="block">
          <defs>
            <radialGradient id="coreGlow">
              <stop offset="0%"   stopColor="#67e8f9" stopOpacity={1} />
              <stop offset="35%"  stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="70%"  stopColor="#a855f7" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="nodeGlow">
              <stop offset="0%"   stopColor="#a5f3fc" stopOpacity={1} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Concentric rings — counter rotating */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            <circle r={240} fill="none" stroke="url(#ringStroke)" strokeWidth={0.7} strokeDasharray="3 8" />
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
            <circle r={190} fill="none" stroke="url(#ringStroke)" strokeWidth={0.8} strokeDasharray="2 4" />
          </motion.g>
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            <circle r={150} fill="none" stroke="url(#ringStroke)" strokeWidth={1.2} strokeOpacity={0.8} />
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
            <motion.g key={n.id} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.4, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}>
              <circle cx={n.x} cy={n.y} r={6} fill="url(#nodeGlow)" />
              <circle cx={n.x} cy={n.y} r={2} fill="#a5f3fc" filter="url(#glow)" />
            </motion.g>
          ))}

          {/* Central pulsing core */}
          <motion.circle
            r={90} fill="url(#coreGlow)"
            animate={{ r: [85, 95, 85], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#glow)"
          />
          <circle r={42} fill="rgba(168,85,247,0.6)" filter="url(#glow)" />
          <circle r={20} fill="#f5d0fe" filter="url(#glow)" />
        </svg>
      </motion.div>

      {/* 5 · Orbiting token pills */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
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
                rotate: { duration: 90, repeat: Infinity, ease: "linear" },
                y: { duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
              }}
            >
              <div
                className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold backdrop-blur-xl whitespace-nowrap"
                style={{
                  background: isCyan
                    ? "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(6,182,212,0.06))"
                    : "linear-gradient(135deg, rgba(168,85,247,0.20), rgba(168,85,247,0.06))",
                  border: `1px solid ${isCyan ? "rgba(6,182,212,0.4)" : "rgba(168,85,247,0.4)"}`,
                  color: isCyan ? "#a5f3fc" : "#e9d5ff",
                  boxShadow: isCyan
                    ? "0 0 20px rgba(6,182,212,0.35)"
                    : "0 0 20px rgba(168,85,247,0.35)",
                }}
              >
                {t.text}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 6 · Foreground text */}
      <div className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.3)",
            color: "#67e8f9",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
          </span>
          TRK LEARNAI · LIVE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-black tracking-tight leading-[1.02] mb-5 max-w-5xl"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #67e8f9 35%, #c084fc 75%, #f5d0fe 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 40px rgba(103,232,249,0.15)",
          }}
        >
          Inside the Mind of an LLM
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
          className="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed mb-5"
          style={{ color: "rgba(226,232,240,0.78)" }}
        >
          Eighteen languages. Twenty-one roadmaps. Live AI that thinks alongside you — from variable to transformer, from <em>git init</em> to <em>kubernetes deploy</em>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}
          className="mb-8"
        >
          <Typewriter />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          <a
            href="/learn/inside-llm"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.22), rgba(168,85,247,0.22))",
              border: "1px solid rgba(103,232,249,0.55)",
              color: "white",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 30px rgba(103,232,249,0.22), inset 0 0 12px rgba(168,85,247,0.12)",
            }}
          >
            <span className="relative z-10">See how an LLM thinks</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-purple-500/20" />
          </a>
          <button
            onClick={onExplore}
            className="group inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-sm"
            style={{
              background: "rgba(15,23,42,0.55)",
              border: "1px solid rgba(34,211,238,0.20)",
              color: "rgba(226,232,240,0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            Pick a roadmap
            <ArrowDownIcon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] font-mono"
          style={{ color: "rgba(165,243,252,0.4)" }}
          animate={{ y: [0, 6, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓ scroll to roadmaps
        </motion.div>
      </div>
    </section>
  );
}
