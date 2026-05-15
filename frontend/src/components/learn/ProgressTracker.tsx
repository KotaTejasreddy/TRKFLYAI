"use client";

import { motion } from "framer-motion";

interface Props {
  completed: number;
  total: number;
  sectionTitle?: string;
}

export default function ProgressTracker({
  completed,
  total,
  sectionTitle,
}: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{"🎯"}</span>
          <span className="text-xs font-semibold text-gray-300">
            {sectionTitle || "Your Progress"}
          </span>
        </div>
        <span className="text-xs font-bold text-indigo-400">
          {completed}/{total} topics
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500"
        />
      </div>

      {/* Motivational message */}
      <div className="mt-2 text-[10px] text-gray-500">
        {pct === 0 && "Start your journey! Click a topic to begin."}
        {pct > 0 && pct < 25 && "Great start! Keep going!"}
        {pct >= 25 && pct < 50 && "You're making real progress!"}
        {pct >= 50 && pct < 75 && "Halfway there! You're doing amazing!"}
        {pct >= 75 && pct < 100 && "Almost done! You're a champion!"}
        {pct === 100 && "Section complete! You're incredible!"}
      </div>
    </div>
  );
}
