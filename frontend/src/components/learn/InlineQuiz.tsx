"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { QuizItem } from "@/types";

interface Props {
  quiz: QuizItem[];
  onPassed: (perfect: boolean) => void;
}

export default function InlineQuiz({ quiz, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = quiz.every((_, i) => answers[i] !== undefined);
  const perfect = submitted && quiz.every((q, i) => answers[i] === q.correct_index);
  const correctCount = quiz.filter((q, i) => answers[i] === q.correct_index).length;

  function pick(qi: number, oi: number) {
    if (submitted) return;
    setAnswers({ ...answers, [qi]: oi });
  }
  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
    onPassed(quiz.every((q, i) => answers[i] === q.correct_index));
  }
  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/[0.06] to-purple-500/[0.06] border border-pink-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-lg">
          🧠
        </span>
        <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider">
          Quick Check ({quiz.length} Q)
        </h4>
        {submitted && (
          <span
            className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full ${
              perfect ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {correctCount} / {quiz.length}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {quiz.map((q, qi) => (
          <div key={qi}>
            <div className="text-sm font-semibold mb-2.5" style={{ color: "var(--text)" }}>
              <span className="text-pink-400 mr-1.5">Q{qi + 1}.</span> {q.question}
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi;
                const isCorrect = oi === q.correct_index;
                let cls = "border-white/10 hover:border-white/20 hover:bg-white/[0.03]";
                if (submitted) {
                  if (isCorrect) cls = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  else if (picked) cls = "border-red-500/50 bg-red-500/10 text-red-300";
                  else cls = "border-white/5 opacity-50";
                } else if (picked) {
                  cls = "border-pink-500/50 bg-pink-500/10 text-pink-300";
                }
                return (
                  <button
                    key={oi}
                    onClick={() => pick(qi, oi)}
                    disabled={submitted}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm flex items-center gap-2.5 transition-all ${cls}`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrect && <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    {submitted && picked && !isCorrect && <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {submitted && q.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 p-2.5 text-xs rounded-lg overflow-hidden"
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                >
                  💡 {q.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={!allAnswered}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              allAnswered
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
            }`}
          >
            Submit answers
          </button>
        ) : (
          <button
            onClick={retry}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Try again
          </button>
        )}
      </div>
    </motion.div>
  );
}
