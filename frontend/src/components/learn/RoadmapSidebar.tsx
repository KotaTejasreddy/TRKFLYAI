"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Roadmap } from "@/types";
import { getCompletionCount } from "@/lib/progress";

interface Props {
  roadmap: Roadmap;
  language: string;
  refreshKey?: number;
}

/**
 * Sticky table-of-contents shown on the left of the roadmap page (desktop only).
 * - Lists all sections with completion bars
 * - Click → smooth-scroll to that section
 * - Highlights the section currently in view via IntersectionObserver
 */
export default function RoadmapSidebar({ roadmap, language, refreshKey }: Props) {
  const [activeSection, setActiveSection] = useState<string>(roadmap.sections[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the topmost visible section
          const sorted = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          const id = sorted[0].target.getAttribute("data-section-id");
          if (id) setActiveSection(id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    document.querySelectorAll("[data-section-id]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [roadmap]);

  function jump(id: string) {
    const el = document.querySelector(`[data-section-id="${id}"]`) as HTMLElement | null;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  const totalCompleted = roadmap.sections.reduce(
    (sum, s) => sum + getCompletionCount(language, s.topics.map((t) => t.id)),
    0
  );
  const totalProgress = roadmap.total_topics > 0 ? (totalCompleted / roadmap.total_topics) * 100 : 0;

  return (
    <aside className="hidden lg:block sticky top-24 self-start w-64 flex-shrink-0">
      <div
        className="rounded-2xl p-4 max-h-[calc(100vh-7rem)] overflow-y-auto"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5"
            style={{ color: "var(--text-muted)" }}>
            On this roadmap
          </div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold" style={{ color: "var(--text)" }}>
              {totalCompleted} / {roadmap.total_topics} topics
            </span>
            <span className="text-emerald-400 font-bold">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <motion.div
              key={`${refreshKey}`}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
        </div>

        {/* Section list */}
        <nav className="space-y-1">
          {roadmap.sections.map((sec) => {
            const completed = getCompletionCount(language, sec.topics.map((t) => t.id));
            const total = sec.topics.length;
            const pct = total > 0 ? (completed / total) * 100 : 0;
            const isActive = sec.id === activeSection;
            const isDone = completed === total && total > 0;
            return (
              <button
                key={sec.id}
                onClick={() => jump(sec.id)}
                className="w-full text-left px-2.5 py-2 rounded-lg transition-colors relative group"
                style={{
                  background: isActive ? "rgba(99,102,241,0.10)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.25)" : "transparent"}`,
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">{sec.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                      >
                        {sec.title}
                      </span>
                      {isDone && <span className="text-emerald-400 text-[10px] flex-shrink-0">✓</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                        {completed}/{total}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
