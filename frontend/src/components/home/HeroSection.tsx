"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const WORDS = ["Intelligence", "Automation", "Innovation", "Precision"];

function AnimatedWord() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden">
      <motion.span
        key={idx}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="block gradient-text"
      >
        {WORDS[idx]}
      </motion.span>
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.025);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.025);
  };
  const resetMouse = () => { mx.set(0); my.set(0); };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
    >
      {/* Deep background */}
      <div className="absolute inset-0" style={{ background: "var(--bg-base)" }} />

      {/* Subtle static grid */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Gradient orbs */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#020206_100%)] pointer-events-none" />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Live badge */}
        <motion.div variants={item} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-gray-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Now shipping v3.0 across all products
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-white">Engineering</span>
          <br />
          <AnimatedWord />
          <br />
          <span className="text-white text-4xl sm:text-5xl md:text-6xl font-semibold">at Scale</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          style={{ color: "var(--text-secondary)" }}
          className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          We build AI-powered systems that solve real-world problems at production
          scale — from neural network training to autonomous infrastructure.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-semibold text-sm overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Products
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/learn"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white font-semibold text-sm transition-all hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 backdrop-blur-sm"
          >
            Start Learning
            <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          variants={item}
          style={{ color: "var(--text-muted)" }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-xs"
        >
          {["SOC 2 Compliant", "99.99% Uptime SLA", "Enterprise Ready", "Open Source Core"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-500/70" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {t}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none" />
    </section>
  );
}
