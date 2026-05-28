"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Section wrapper used across all "Inside the LLM" concept blocks.
 * Provides the consistent dark-card + cyan-accent title aesthetic
 * shown in the user's reference screenshot.
 */
export default function ConceptSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id?: string;
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id={id}
      ref={ref}
      className="relative py-16 md:py-24 border-b"
      style={{ borderColor: "rgba(34,211,238,0.08)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section number badge */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="font-mono text-[11px] font-bold tracking-[0.2em] px-2 py-1 rounded"
              style={{
                background: "rgba(34,211,238,0.10)",
                border: "1px solid rgba(34,211,238,0.30)",
                color: "#67e8f9",
              }}
            >
              {number}
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(34,211,238,0.4), transparent)" }} />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #67e8f9 60%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-2xl"
            style={{ color: "rgba(226,232,240,0.78)" }}>
            {description}
          </p>

          {/* Body content */}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
