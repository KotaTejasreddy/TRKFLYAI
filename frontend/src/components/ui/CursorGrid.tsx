"use client";

import { useEffect, useRef, useCallback } from "react";

const CELL = 48;
const RADIUS = 400;

export default function CursorGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number>(0);
  const active = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x: mx, y: my } = mouse.current;
    if (!active.current) {
      raf.current = requestAnimationFrame(draw);
      return;
    }

    const cols = Math.ceil(canvas.width / CELL) + 1;
    const rows = Math.ceil(canvas.height / CELL) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * CELL + CELL / 2;
        const cy = r * CELL + CELL / 2;
        const dist = Math.hypot(cx - mx, cy - my);
        if (dist > RADIUS) continue;

        const t = 1 - dist / RADIUS;
        const ease = t * t * t;

        // Border glow
        ctx.strokeStyle = `rgba(99,102,241,${ease * 0.55})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);

        // Cell fill
        ctx.fillStyle = `rgba(139,92,246,${ease * 0.07})`;
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
      }
    }

    // Soft radial glow at cursor
    const grd = ctx.createRadialGradient(mx, my, 0, mx, my, RADIUS * 0.5);
    grd.addColorStop(0, "rgba(99,102,241,0.07)");
    grd.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    raf.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      active.current = true;
    };
    const onLeave = () => {
      active.current = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
