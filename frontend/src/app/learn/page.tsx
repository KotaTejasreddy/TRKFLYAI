"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon, BoltIcon, FireIcon, SparklesIcon } from "@heroicons/react/24/outline";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartResume from "@/components/learn/SmartResume";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPlans } from "@/lib/api";
import type { PlanInfo } from "@/types";

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
  const { user, access } = useAuth();
  const [plans, setPlans] = useState<PlanInfo[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getPlans();
      if (data) setPlans(data.plans);
    })();
  }, []);

  const onTrial = access?.plan === "trial";
  const onPaid = access && access.plan !== "trial" && access.plan !== "none";
  const currentPlanLabel = onPaid ? access?.plan : null;

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

          {/* Subscription panel */}
          <motion.div variants={itemVariants} className="mt-12">
            {/* Status strip */}
            {access && (
              <div className="mb-4 p-4 rounded-2xl flex items-center gap-3 flex-wrap"
                style={{
                  background: onTrial
                    ? "linear-gradient(90deg, rgba(245,158,11,0.10), rgba(99,102,241,0.10))"
                    : onPaid
                      ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(99,102,241,0.10))"
                      : "var(--bg-card)",
                  border: `1px solid ${onTrial ? "rgba(245,158,11,0.3)" : onPaid ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  onTrial ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : onPaid ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                  : "bg-gradient-to-br from-indigo-500 to-violet-600"
                }`}>
                  {onTrial ? <FireIcon className="w-5 h-5 text-white" />
                   : onPaid ? <CheckIcon className="w-5 h-5 text-white" />
                   : <SparklesIcon className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                    style={{ color: onTrial ? "rgb(252,211,77)" : onPaid ? "rgb(110,231,183)" : "var(--text-muted)" }}>
                    {onTrial ? "Free trial active" : onPaid ? `${currentPlanLabel} plan active` : "Subscription"}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {access.days_left} day{access.days_left !== 1 ? "s" : ""} left
                    {access.expires_at && (
                      <span className="text-xs font-normal ml-2" style={{ color: "var(--text-secondary)" }}>
                        · until {new Date(access.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Link href="/subscribe"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    onTrial
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                      : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  }`}>
                  {onTrial ? "Upgrade now" : onPaid ? "Manage plan" : "Subscribe"} →
                </Link>
              </div>
            )}

            {/* Plan cards */}
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
              {onPaid ? "Plans you can switch to" : "Plans"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative p-4 rounded-2xl ${p.popular ? "shadow-[0_0_25px_rgba(99,102,241,0.15)]" : ""}`}
                  style={{
                    background: p.popular
                      ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))"
                      : "var(--bg-card)",
                    border: `1px solid ${p.popular ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                  }}
                >
                  {p.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                    {p.label}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold gradient-text">₹{p.amount}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      / {p.days}d
                    </span>
                  </div>
                  <div className="text-[10px] mb-3" style={{ color: "var(--text-secondary)" }}>
                    ₹{(p.amount / p.days).toFixed(2)} per day
                  </div>
                  <Link href="/subscribe"
                    className={`w-full block py-2 rounded-lg text-xs font-bold text-center transition-all ${
                      p.popular
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_16px_rgba(99,102,241,0.4)]"
                        : ""
                    }`}
                    style={!p.popular ? { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" } : undefined}>
                    Choose {p.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
              <BoltIcon className="w-3 h-3 inline mr-1" />
              Secure payments by Razorpay · UPI · Cards · Net Banking · Cancel anytime
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
