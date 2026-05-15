"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { StructuredLearnResponse } from "@/types";
import InlineQuiz from "./InlineQuiz";
import CodePlayground from "./CodePlayground";
import AlgoVisualizer, { resolveViz } from "./AlgoVisualizer";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

interface Props {
  lesson: StructuredLearnResponse;
  onSimplify?: (content: string) => void;
  simplifying?: boolean;
  onQuizComplete?: (perfect: boolean) => void;
  topicTitle?: string;
}

export default function StructuredLessonCard({
  lesson, onSimplify, simplifying, onQuizComplete, topicTitle,
}: Props) {
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [vizOpen, setVizOpen] = useState(false);
  const viz = topicTitle ? resolveViz(topicTitle) : null;

  return (
    <div className="space-y-4">
      {/* Definition Card */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg">📝</span>
          <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">Definition</h4>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed">{lesson.definition}</p>
      </motion.div>

      {/* Analogy Card */}
      <motion.div
        custom={1} variants={cardVariants} initial="hidden" animate="visible"
        className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">💡</span>
          <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Real-Life Analogy</h4>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed italic">{lesson.analogy}</p>
      </motion.div>

      {/* Code Example Card */}
      {lesson.code_example && (
        <motion.div
          custom={2} variants={cardVariants} initial="hidden" animate="visible"
          className="rounded-2xl overflow-hidden border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg">{"</>"}</span>
            <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Code Example</h4>
            <button
              onClick={() => setPlaygroundOpen(!playgroundOpen)}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-shadow"
            >
              ▶ Try it
            </button>
          </div>
          <pre className="p-5 bg-black/40 text-sm text-gray-300 overflow-x-auto leading-relaxed">
            <code>{lesson.code_example}</code>
          </pre>
          <div className="px-5 pb-3" style={{ background: "rgba(0,0,0,0.4)" }}>
            <CodePlayground
              initialCode={lesson.code_example}
              open={playgroundOpen}
              onClose={() => setPlaygroundOpen(false)}
            />
          </div>
        </motion.div>
      )}

      {/* Algorithm Visualizer (DSA topics only) */}
      {viz && (
        <motion.div custom={2.5} variants={cardVariants} initial="hidden" animate="visible">
          <button
            onClick={() => setVizOpen(!vizOpen)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/30 hover:border-violet-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">🎬</span>
              <div className="text-left">
                <div className="text-sm font-bold text-violet-300">Visualize: {viz.title}</div>
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Step through the algorithm with animations
                </div>
              </div>
            </div>
            <span className="text-violet-300 text-xs font-bold">{vizOpen ? "Hide" : "Show"} →</span>
          </button>
          <AlgoVisualizer spec={viz} open={vizOpen} onClose={() => setVizOpen(false)} />
        </motion.div>
      )}

      {/* Explanation Card */}
      <motion.div
        custom={3} variants={cardVariants} initial="hidden" animate="visible"
        className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">🔍</span>
          <h4 className="text-sm font-bold text-violet-300 uppercase tracking-wider">Step-by-Step Explanation</h4>
        </div>
        <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{lesson.explanation}</div>
      </motion.div>

      {/* Motivation Banner */}
      {lesson.motivation && (
        <motion.div
          custom={4} variants={cardVariants} initial="hidden" animate="visible"
          className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-violet-500/10 to-pink-500/5 border border-white/[0.06] text-center"
        >
          <p className="text-sm text-gray-300 font-medium">{lesson.motivation}</p>
        </motion.div>
      )}

      {/* Quiz */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <motion.div custom={4.5} variants={cardVariants} initial="hidden" animate="visible">
          <InlineQuiz quiz={lesson.quiz} onPassed={(perfect) => onQuizComplete?.(perfect)} />
        </motion.div>
      )}

      {/* Simplify Button */}
      {onSimplify && (
        <motion.div
          custom={5} variants={cardVariants} initial="hidden" animate="visible"
          className="flex justify-center"
        >
          <button
            onClick={() => onSimplify(`${lesson.definition}\n${lesson.analogy}\n${lesson.explanation}`)}
            disabled={simplifying}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold hover:from-pink-500/30 hover:to-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
          >
            {simplifying ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Simplifying...
              </>
            ) : (
              <><span>{"🪄"}</span> Explain Even Simpler</>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
