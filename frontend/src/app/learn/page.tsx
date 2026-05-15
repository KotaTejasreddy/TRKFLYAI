"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { generateLesson } from "@/lib/api";
import SmartResume from "@/components/learn/SmartResume";

const TOPICS = [
  { id: "Python", label: "Python", icon: "🐍", color: "from-yellow-500 to-blue-500", roadmap: "python" },
  { id: "JavaScript", label: "JavaScript", icon: "⚡", color: "from-yellow-400 to-yellow-600", roadmap: "javascript" },
  { id: "DSA", label: "DSA", icon: "👑", color: "from-green-500 to-teal-500", roadmap: "dsa" },
  { id: "Machine Learning", label: "Machine Learning", icon: "🧠", color: "from-purple-500 to-pink-500", roadmap: "machine-learning" },
  { id: "Deep Learning", label: "Deep Learning", icon: "🔬", color: "from-blue-500 to-violet-600", roadmap: "deep-learning" },
  { id: "Generative AI", label: "Generative AI", icon: "✨", color: "from-emerald-400 to-cyan-500", roadmap: "generative-ai" },
  { id: "Agentic AI", label: "Agentic AI", icon: "🤖", color: "from-orange-500 to-red-500", roadmap: "agentic-ai" },
  { id: "TypeScript", label: "TypeScript", icon: "📘", color: "from-blue-400 to-blue-600", roadmap: "typescript" },
  { id: "Java", label: "Java", icon: "☕", color: "from-red-400 to-red-600", roadmap: "java" },
  { id: "C++", label: "C++", icon: "💻", color: "from-gray-500 to-gray-700", roadmap: "cpp" },
  { id: "Go", label: "Go", icon: "🐹", color: "from-green-400 to-green-600", roadmap: "go" },
  { id: "React", label: "React", icon: "⚛️", color: "from-cyan-400 to-blue-500", roadmap: "react" },
  { id: "Node js", label: "Node.js", icon: "🟢", color: "from-green-500 to-green-700", roadmap: "nodejs" },
  { id: "System Design", label: "System Design", icon: "🏗️", color: "from-yellow-500 to-yellow-700", roadmap: "system-design" },
  { id: "SQL", label: "SQL", icon: "🗄️", color: "from-blue-500 to-blue-700", roadmap: "sql" },
  { id: "Docker", label: "Docker", icon: "🐳", color: "from-blue-400 to-blue-600", roadmap: "docker" },
  { id: "GIT", label: "GIT", icon: "🌳", color: "from-gray-400 to-gray-600", roadmap: "git" },
];

const MODES = [
  {
    id: "story",
    label: "Story Mode",
    description: "Simple stories and real-life analogies. Even a child can understand.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    accent: "border-emerald-500/30 hover:border-emerald-500/60",
    activeAccent: "border-emerald-500 bg-emerald-500/10",
    textColor: "text-emerald-400",
  },
  {
    id: "technical",
    label: "Technical Mode",
    description: "Deep-dive with code examples, architecture, and best practices.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    accent: "border-indigo-500/30 hover:border-indigo-500/60",
    activeAccent: "border-indigo-500 bg-indigo-500/10",
    textColor: "text-indigo-400",
  },
  {
    id: "interview",
    label: "Interview Mode",
    description: "Questions, answers, and pro tips for acing technical interviews.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    accent: "border-amber-500/30 hover:border-amber-500/60",
    activeAccent: "border-amber-500 bg-amber-500/10",
    textColor: "text-amber-400",
  },
];

const LANGUAGES = [
  "English",
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Portuguese",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LearnPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [mode, setMode] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = topic && mode;

  async function handleGenerate() {
    if (!canGenerate) return;

    setLoading(true);
    setError("");
    setContent("");

    const { data, error: apiError } = await generateLesson({
      topic,
      language,
      mode,
      subtopic: subtopic || undefined,
    });

    if (apiError || !data) {
      setError(apiError || "Failed to generate lesson. Please try again.");
    } else {
      setContent(data.content);
    }

    setLoading(false);
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <SectionHeading
              title="TRK LearnAI"
              subtitle="Choose a topic, pick your language, select how you want to learn — and let AI craft the perfect explanation for you."
            />
            <div className="flex justify-center gap-2 -mt-8 mb-2">
              <Link
                href="/learn/bookmarks"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                🔖 Bookmarks
              </Link>
              <Link
                href="/learn/interview"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors"
              >
                💼 Mock Interview
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
              >
                📊 Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Smart Resume banner */}
          <motion.div variants={itemVariants}>
            <SmartResume />
          </motion.div>

          {/* Step 1 — Topic */}
          <motion.div variants={itemVariants} className="mb-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-bold">
                1
              </span>
              Choose a Topic
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.roadmap) {
                      router.push(`/learn/roadmap/${t.roadmap}`);
                    } else {
                      setTopic(t.id);
                    }
                  }}
                  className={`relative group p-4 rounded-xl border text-left transition-all duration-200 ${
                    topic === t.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-sm font-semibold text-white">
                    {t.label}
                  </div>
                  {t.roadmap && (
                    <Link
                      href={`/learn/roadmap/${t.roadmap}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View Roadmap
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  )}
                  {topic === t.id && (
                    <motion.div
                      layoutId="topic-check"
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Step 2 — Language + Subtopic */}
          <motion.div variants={itemVariants} className="mb-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-bold">
                2
              </span>
              Language &amp; Focus
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Response Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <option
                      key={lang}
                      value={lang}
                      className="bg-[#0a0a0f] text-white"
                    >
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Subtopic{" "}
                  <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder={
                    topic
                      ? `e.g. ${topic === "Python" ? "decorators, async/await" : topic === "Machine Learning" ? "random forests, gradient descent" : "transformers, attention"}`
                      : "Select a topic first"
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Step 3 — Mode */}
          <motion.div variants={itemVariants} className="mb-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-bold">
                3
              </span>
              Select Learning Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`relative p-5 rounded-xl border text-left transition-all duration-200 ${
                    mode === m.id
                      ? m.activeAccent
                      : `border-white/10 bg-white/5 ${m.accent}`
                  }`}
                >
                  <div
                    className={`mb-3 ${
                      mode === m.id ? m.textColor : "text-gray-400"
                    }`}
                  >
                    {m.icon}
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    {m.label}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {m.description}
                  </div>
                  {mode === m.id && (
                    <motion.div
                      layoutId="mode-check"
                      className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
                        m.id === "story"
                          ? "bg-emerald-500"
                          : m.id === "technical"
                            ? "bg-indigo-500"
                            : "bg-amber-500"
                      }`}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div variants={itemVariants} className="mb-10">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                canGenerate && !loading
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-3">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating your lesson...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Generate Lesson
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                  </svg>
                </span>
              )}
            </button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output */}
          <AnimatePresence>
            {content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard hover={false} glow className="relative overflow-hidden">
                  {/* Header bar */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {TOPICS.find((t) => t.id === topic)?.icon}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {topic}
                          {subtopic && (
                            <span className="text-gray-500"> / {subtopic}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {MODES.find((m) => m.id === mode)?.label} &middot;{" "}
                          {language}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(content);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Content */}
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                      {content}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!content && !loading && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <div className="text-4xl mb-4 opacity-30">🧠</div>
              <p className="text-gray-600 text-sm">
                Select a topic and mode, then hit Generate to start learning.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
