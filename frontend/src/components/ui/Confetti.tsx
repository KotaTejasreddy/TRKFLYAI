"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight self-contained canvas confetti.
 * Mount it once, call `fire()` via the imperative ref OR just mount with `trigger` prop.
 * No external dependency.
 */

interface Particle {
  x: number; y: number; vx: number; vy: number;
  rot: number; vrot: number; size: number;
  color: string; life: number; ttl: number;
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

export default function Confetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn ~120 particles from the centre-top
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 8;
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 12,
        size: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        ttl: 90 + Math.random() * 30,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life++;
        if (p.life > p.ttl) continue;
        p.vy += 0.18; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        const alpha = 1 - p.life / p.ttl;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
        next.push(p);
      }
      particlesRef.current = next;
      if (next.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    />
  );
}
