"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartResume from "@/components/learn/SmartResume";

const TOPICS = [
  { id: "Python",          label: "Python",          icon: "🐍",  color: "from-yellow-500 to-blue-500",   roadmap: "python" },
  { id: "JavaScript",      label: "JavaScript",      icon: "⚡",  color: "from-yellow-400 to-yellow-600", roadmap: "javascript" },
  { id: "DSA",             label: "DSA",             icon: "👑",  color: "from-green-500 to-teal-500",    roadmap: "dsa" },
  { id: "Machine Learning",label: "Machine Learning",icon: "🧠",  color: "from-purple-500 to-pink-500",   roadmap: "machine-learning" },
  { id: "Deep Learning",   label: "Deep Learning",   icon: "🔬",  color: "from-blue-500 to-violet-600",   roadmap: "deep-learning" },
  { id: "Generative AI",   label: "Generative AI",   icon: "✨",  color: "from-emerald-400 to-cyan-500",  roadmap: "generative-ai" },
  { id: "Agentic AI",      label: "Agentic AI",      icon: "🤖",  color: "from-orange-500 to-red-500",    roadmap: "agentic-ai" },
  { id: "TypeScript",      label: "TypeScript",      icon: "📘",  color: "from-blue-400 to-blue-600",     roadmap: "typescript" },
  { id: "Java",            label: "Java",            icon: "☕",  color: "from-red-400 to-red-600",       roadmap: "java" },
  { id: "C++",             label: "C++",             icon: "💻",  color: "from-gray-500 to-gray-700",     roadmap: "cpp" },
  { id: "Go",              label: "Go",              icon: "🐹",  color: "from-green-400 to-green-600",   roadmap: "go" },
  { id: "React",           label: "React",           icon: "⚛️", color: "from-cyan-400 to-blue-500",     roadmap: "react" },
  { id: "Node.js",         label: "Node.js",         icon: "🟢",  color: "from-green-500 to-green-700",   roadmap: "nodejs" },
  { id: "System Design",   label: "System Design",   icon: "🏗️", color: "from-yellow-500 to-yellow-700", roadmap: "system-design" },
  { id: "SQL",             label: "SQL",             icon: "🗄️", color: "from-blue-500 to-blue-700",     roadmap: "sql" },
  { id: "Docker",          label: "Docker",          icon: "🐳",  color: "from-blue-400 to-blue-600",     roadmap: "docker" },
  { id: "Git",             label: "Git",             icon: "🌳",  color: "from-gray-400 to-gray-600",     roadmap: "git" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LearnPage() {
  const router = useRouter();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <SectionHeading
              title="TRK LearnAI"
              subtitle="Pick a roadmap below. Inside each topic, choose your language and learning mode — AI crafts the lesson for you."
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

          {/* Roadmap picker */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
              Choose a roadmap
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {TOPICS.map((t) => (
                <motion.button
                  key={t.id}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/learn/roadmap/${t.roadmap}`)}
                  className="group relative p-4 rounded-xl border text-left transition-all duration-200 hover:border-indigo-500/40"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br ${t.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                  <div className="text-2xl mb-2 relative">{t.icon}</div>
                  <div className="text-sm font-semibold mb-1 relative" style={{ color: "var(--text)" }}>
                    {t.label}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 relative">
                    Open roadmap
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
