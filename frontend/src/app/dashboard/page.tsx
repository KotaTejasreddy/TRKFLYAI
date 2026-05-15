"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BoltIcon, FireIcon, BookmarkIcon, ChartBarIcon, ArrowRightIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { useXp } from "@/lib/useXp";
import { getLevel, getXpToNextLevel } from "@/lib/xp";
import { listBookmarks, type Bookmark } from "@/lib/bookmarks";
import { getLastActivity, formatRelative, type Activity } from "@/lib/activity";
import { STATIC_ROADMAPS } from "@/lib/roadmaps";
import { getCompletionCount } from "@/lib/progress";

export default function DashboardPage() {
  const xp = useXp();
  const level = getLevel(xp.xp);
  const { current: xpInLevel, needed: xpNeeded } = getXpToNextLevel(xp.xp);
  const xpPct = (xpInLevel / xpNeeded) * 100;

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    setBookmarks(listBookmarks());
    setActivity(getLastActivity());
  }, []);

  // Roadmap progress summary
  const roadmapStats = Object.entries(STATIC_ROADMAPS).map(([slug, rm]) => {
    const allIds = rm.sections.flatMap((s) => s.topics.map((t) => t.id));
    const done = getCompletionCount(slug, allIds);
    return { slug, title: rm.title, done, total: rm.total_topics, pct: rm.total_topics > 0 ? (done / rm.total_topics) * 100 : 0 };
  }).sort((a, b) => b.pct - a.pct);

  const totalCompleted = roadmapStats.reduce((s, r) => s + r.done, 0);
  const totalTopics = roadmapStats.reduce((s, r) => s + r.total, 0);

  // 7-day XP "history" — bucket history entries by date
  const last7Days = (() => {
    const days: { date: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const sum = (xp.history || []).filter((h) => h.date === d).reduce((s, h) => s + h.xp, 0);
      days.push({ date: d, xp: sum });
    }
    return days;
  })();
  const maxDay = Math.max(1, ...last7Days.map((d) => d.xp));

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Your Dashboard</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Track your progress, streak, and learning history.
          </p>
        </motion.div>

        {/* Hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BoltIcon className="w-5 h-5 text-indigo-300" />}
            label="Level"
            value={`${level}`}
            sub={`${xpInLevel}/${xpNeeded} to next`}
            accent="from-indigo-500 to-violet-500"
          />
          <StatCard
            icon={<FireIcon className="w-5 h-5 text-orange-300" />}
            label="Streak"
            value={`${xp.streakDays}`}
            sub={xp.streakDays === 1 ? "day" : "days"}
            accent="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<ChartBarIcon className="w-5 h-5 text-emerald-300" />}
            label="Topics done"
            value={`${totalCompleted}`}
            sub={`of ${totalTopics}`}
            accent="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={<BookmarkIcon className="w-5 h-5 text-amber-300" />}
            label="Bookmarks"
            value={`${bookmarks.length}`}
            sub={bookmarks.length === 1 ? "saved" : "saved"}
            accent="from-amber-500 to-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* XP progress to next level */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
                  Progress to Level {level + 1}
                </div>
                <div className="text-2xl font-bold mt-1" style={{ color: "var(--text)" }}>
                  {xp.xp} XP
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Next milestone</div>
                <div className="text-lg font-bold text-indigo-300">{(level + 1) * 100} XP</div>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
              />
            </div>

            {/* Last 7 days XP bars */}
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider font-bold mb-3" style={{ color: "var(--text-muted)" }}>
                Last 7 days
              </div>
              <div className="flex items-end gap-2 h-24">
                {last7Days.map((d) => {
                  const dayName = new Date(d.date).toLocaleDateString("en", { weekday: "short" });
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.xp / maxDay) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className={`w-full rounded-t-md ${d.xp > 0 ? "bg-gradient-to-t from-indigo-500 to-violet-500" : "bg-white/5"}`}
                        style={{ minHeight: d.xp > 0 ? "8px" : "2px" }}
                        title={`${d.xp} XP`}
                      />
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {dayName.slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Continue learning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl flex flex-col"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-4 h-4 text-indigo-300" />
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">Resume</span>
            </div>
            {activity ? (
              <>
                <div className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>
                  {activity.topicTitle}
                </div>
                <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                  {activity.roadmapTitle} · {formatRelative(activity.at)}
                </div>
                <Link
                  href={`/learn/roadmap/${activity.roadmap}#${activity.topicId}`}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold"
                >
                  Continue <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="text-3xl mb-2 opacity-50">📚</div>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  No recent activity. Pick a roadmap to start.
                </p>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                >
                  Browse <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Roadmap progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapIcon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Roadmap progress
            </h3>
          </div>
          <div className="space-y-3">
            {roadmapStats.map((r) => (
              <Link
                key={r.slug}
                href={`/learn/roadmap/${r.slug}`}
                className="block p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold group-hover:text-indigo-300 transition-colors" style={{ color: "var(--text)" }}>
                    {r.title}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {r.done}/{r.total}
                    {r.pct === 100 && <span className="ml-1.5 text-emerald-400">✓</span>}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full ${r.pct === 100
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Bookmarks preview */}
        {bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkIcon className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                  Pinned
                </h3>
              </div>
              <Link href="/learn/bookmarks" className="text-xs font-semibold text-indigo-300">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bookmarks.slice(0, 6).map((b) => (
                <Link
                  key={b.topicId}
                  href={`/learn/roadmap/${b.roadmap}#${b.topicId}`}
                  className="p-3 rounded-xl hover:bg-white/[0.03] transition-colors block"
                >
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                    {b.topicTitle}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {b.roadmapTitle}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-2xl relative overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`} />
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </motion.div>
  );
}
