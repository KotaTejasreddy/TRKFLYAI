"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getLastActivity, formatRelative, type Activity } from "@/lib/activity";

const DISMISSED_KEY = "trk_resume_dismissed_at";

export default function SmartResume() {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const a = getLastActivity();
    if (!a) return;
    // Hide if user dismissed AFTER this activity
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && new Date(dismissedAt).getTime() >= new Date(a.at).getTime()) return;
    setActivity(a);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setActivity(null);
  }

  if (!activity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mb-8 p-4 rounded-2xl flex items-center gap-4"
      style={{
        background: "linear-gradient(90deg, rgba(99,102,241,0.10), rgba(139,92,246,0.10))",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: "0 0 30px rgba(99,102,241,0.10)",
      }}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
        <ClockIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-0.5">
          Continue where you left off · {formatRelative(activity.at)}
        </div>
        <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
          {activity.topicTitle}
        </div>
        <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
          {activity.roadmapTitle} · {activity.sectionTitle}
        </div>
      </div>
      <Link
        href={`/learn/roadmap/${activity.roadmap}#${activity.topicId}`}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold whitespace-nowrap hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow flex-shrink-0"
      >
        Resume
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
      <button
        onClick={dismiss}
        className="p-1.5 rounded-lg transition-colors flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
        title="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
