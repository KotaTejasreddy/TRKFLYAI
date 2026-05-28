"use client";

import { motion } from "framer-motion";

/**
 * AuroraBg — full-bleed animated aurora/nebula background.
 * Replaces the previous CSS grid background everywhere on LearnAI.
 *
 * Layers:
 *   1. Deep base — near-black with a subtle vertical gradient
 *   2. 5 soft color blobs (cyan, violet, pink, blue, indigo) drifting on
 *      independent timelines — gives the "northern lights" effect
 *   3. Top + bottom vignettes so content reads cleanly over the colors
 *   4. Optional noise overlay (SVG fractalNoise) for grain texture
 */
export default function AuroraBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 1 · Deep base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% 0%, #0b0418 0%, #050010 50%, #02020a 100%)",
        }}
      />

      {/* 2 · Aurora blobs */}
      <motion.div
        className="absolute -top-32 -left-20 w-[55vw] h-[55vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.50) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, 40, -20, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-[60vw] h-[60vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 65%)",
          filter: "blur(90px)",
        }}
        animate={{ x: [0, -60, 30, 0], y: [0, 30, -40, 0], scale: [1, 1.08, 1.15, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-[50vw] h-[50vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.38) 0%, transparent 65%)",
          filter: "blur(100px)",
        }}
        animate={{ x: [0, 80, -20, 0], y: [0, -40, 30, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 left-1/3 w-[40vw] h-[40vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, -40, 50, 0], y: [0, 50, -30, 0], scale: [1, 1.1, 0.92, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-[45vw] h-[45vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.40) 0%, transparent 65%)",
          filter: "blur(85px)",
        }}
        animate={{ x: [0, 40, -50, 0], y: [0, -30, 40, 0], scale: [1, 0.95, 1.12, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3 · Top + bottom vignettes */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(to bottom, rgba(2,2,10,0.85), transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{ background: "linear-gradient(to top, rgba(2,2,10,0.9), transparent)" }}
      />

      {/* 4 · Grain (subtle SVG fractal noise) */}
      <svg
        className="absolute inset-0 w-full h-full mix-blend-overlay"
        style={{ opacity: 0.07 }}
      >
        <filter id="aurora-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-noise)" />
      </svg>
    </div>
  );
}
