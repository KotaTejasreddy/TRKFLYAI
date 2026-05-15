"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  padding = "p-6",
}: GlassCardProps) {
  return (
    <motion.div
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
      className={`
        backdrop-blur-xl border rounded-2xl
        ${padding}
        ${glow ? "animate-glow-pulse" : ""}
        ${hover ? "transition-all duration-300" : ""}
        ${className}
      `}
      whileHover={
        hover
          ? {
              y: -4,
              borderColor: "rgba(99,102,241,0.35)",
              boxShadow: "0 0 40px rgba(99,102,241,0.1)",
            }
          : undefined
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
