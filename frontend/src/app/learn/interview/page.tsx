"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, BoltIcon } from "@heroicons/react/24/outline";
import { STATIC_ROADMAPS } from "@/lib/roadmaps";
import { getInterviewQuestions, gradeInterview } from "@/lib/api";
import type { InterviewGradeResponse } from "@/types";

const TOPIC_DISPLAY: Record<string, string> = {
  dsa: "DSA",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
  go: "Go",
  react: "React",
  nodejs: "Node.js",
  "system-design": "System Design",
  sql: "SQL",
  docker: "Docker",
  git: "Git",
  "machine-learning": "Machine Learning",
  "deep-learning": "Deep Learning",
  "generative-ai": "Generative AI",
  "agentic-ai": "Agentic AI",
};

const LANGUAGES = [
  "English", "Telugu", "Hindi", "Tamil", "Kannada", "Spanish",
  "French", "German", "Japanese", "Korean", "Chinese", "Arabic",
];

type Phase = "setup" | "in-progress" | "grading" | "result";

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState<string>("dsa");
  const [subtopic, setSubtopic] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  const [error, setError] = useState("");
  const [grade, setGrade] = useState<InterviewGradeResponse | null>(null);

  const subtopicOptions = STATIC_ROADMAPS[topic]?.sections.flatMap((s) => s.topics.map((t) => t.title)) ?? [];

  async function start() {
    setError("");
    setPhase("in-progress");
    setQuestions([]);
    setAnswers([]);
    setIdx(0);
    const { data, error: e } = await getInterviewQuestions({
      topic: TOPIC_DISPLAY[topic] ?? topic,
      subtopic: subtopic || undefined,
      language,
      difficulty,
    });
    if (e || !data) {
      const msg = (e || "").toLowerCase();
      setError(msg.includes("quota") || msg.includes("429")
        ? "Daily AI quota exhausted on the free tier. Try again later."
        : (e || "Failed to generate questions."));
      setPhase("setup");
      return;
    }
    setQuestions(data.questions);
    setAnswers(new Array(data.questions.length).fill(""));
  }

  function next() {
    if (idx < questions.length - 1) setIdx(idx + 1);
  }
  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }

  async function submit() {
    setPhase("grading");
    const { data, error: e } = await gradeInterview({
      topic: TOPIC_DISPLAY[topic] ?? topic,
      subtopic: subtopic || undefined,
      language,
      answers: questions.map((q, i) => ({ question: q, answer: answers[i] || "" })),
    });
    if (e || !data) {
      setError(e || "Grading failed.");
      setPhase("in-progress");
      return;
    }
    setGrade(data);
    setPhase("result");
  }

  function reset() {
    setPhase("setup");
    setQuestions([]); setAnswers([]); setIdx(0);
    setGrade(null); setError("");
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeftIcon className="w-4 h-4" /> Back to LearnAI
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Mock Interview</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            5 senior-level questions, you answer, AI grades — like a 30-min phone screen.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* SETUP */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-6 rounded-2xl space-y-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

                {/* Topic */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>Topic</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(TOPIC_DISPLAY).map(([slug, label]) => (
                      <button
                        key={slug}
                        onClick={() => { setTopic(slug); setSubtopic(""); }}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          topic === slug
                            ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtopic */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>Focus area (optional)</label>
                  <select
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  >
                    <option value="">— Any subtopic —</option>
                    {subtopicOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Language + Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>Difficulty</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["easy", "medium", "hard"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                            difficulty === d
                              ? "border-violet-500 bg-violet-500/15 text-violet-300"
                              : "border-white/10 bg-white/5"
                          }`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
                )}

                <button
                  onClick={start}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white text-sm font-bold hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-shadow"
                >
                  Start Interview →
                </button>
              </div>
            </motion.div>
          )}

          {/* IN PROGRESS */}
          {phase === "in-progress" && questions.length > 0 && (
            <motion.div key="ip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-8 bg-indigo-500" : answers[i] ? "w-4 bg-emerald-500" : "w-4 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <div className="p-6 rounded-2xl mb-4"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-xs uppercase tracking-wider font-bold text-indigo-300 mb-2">
                  Question {idx + 1} of {questions.length}
                </div>
                <div className="text-lg font-semibold leading-relaxed" style={{ color: "var(--text)" }}>
                  {questions[idx]}
                </div>
              </div>

              <textarea
                value={answers[idx]}
                onChange={(e) => {
                  const next = [...answers]; next[idx] = e.target.value; setAnswers(next);
                }}
                placeholder="Type your answer here. Be specific. Think out loud."
                className="w-full px-4 py-3 rounded-2xl text-sm leading-relaxed resize-y min-h-[180px] focus:outline-none focus:border-indigo-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={prev}
                  disabled={idx === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-colors"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  <ArrowLeftIcon className="w-4 h-4" /> Previous
                </button>
                {idx < questions.length - 1 ? (
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold"
                  >
                    Next <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold"
                  >
                    Submit for grading <CheckCircleIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* GRADING */}
          {phase === "grading" && (
            <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="w-12 h-12 border-2 border-indigo-500/30 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                AI senior interviewer is evaluating your answers…
              </p>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === "result" && grade && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {/* Overall scorecard */}
              <div className="p-6 rounded-2xl text-center"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(16,185,129,0.10))", border: "1px solid rgba(99,102,241,0.30)" }}>
                <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>Overall Score</div>
                <div className="text-6xl font-bold mb-3">
                  <span className="gradient-text">{grade.overall_score}</span>
                  <span className="text-2xl" style={{ color: "var(--text-muted)" }}>/10</span>
                </div>
                <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "var(--text)" }}>
                  {grade.overall_feedback}
                </p>
              </div>

              {/* Per-question breakdown */}
              {grade.per_question.map((g, i) => {
                const tone = g.score >= 8 ? "emerald" : g.score >= 5 ? "amber" : "red";
                const ring = tone === "emerald" ? "border-emerald-500/30" : tone === "amber" ? "border-amber-500/30" : "border-red-500/30";
                const accent = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-300" : "text-red-300";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`p-5 rounded-2xl ${ring}`}
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${accent}`}
                        style={{ background: `rgba(255,255,255,0.05)`, border: `1px solid currentColor` }}>
                        {g.score}/10
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "var(--text-muted)" }}>
                          Q{i + 1}
                        </div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{questions[i]}</div>
                      </div>
                    </div>
                    <div className="pl-13 space-y-2 text-sm">
                      {g.strengths && (
                        <div>
                          <span className="text-xs font-bold text-emerald-400">✓ Strengths: </span>
                          <span style={{ color: "var(--text-secondary)" }}>{g.strengths}</span>
                        </div>
                      )}
                      {g.improvements && (
                        <div>
                          <span className="text-xs font-bold text-amber-400">↑ Improve: </span>
                          <span style={{ color: "var(--text-secondary)" }}>{g.improvements}</span>
                        </div>
                      )}
                      {g.ideal_answer && (
                        <details className="mt-2">
                          <summary className="text-xs font-bold text-indigo-400 cursor-pointer">▸ Ideal answer</summary>
                          <div className="mt-2 p-3 rounded-lg text-xs leading-relaxed"
                            style={{ background: "rgba(99,102,241,0.06)", color: "var(--text)" }}>
                            {g.ideal_answer}
                          </div>
                        </details>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={reset}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  New interview
                </button>
                <Link href="/dashboard"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold text-center inline-flex items-center justify-center gap-1.5"
                >
                  <BoltIcon className="w-4 h-4" /> Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
