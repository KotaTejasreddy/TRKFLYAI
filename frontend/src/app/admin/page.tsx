"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChartBarIcon, BoltIcon, BookmarkIcon, MapIcon, UsersIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { STATIC_ROADMAPS } from "@/lib/roadmaps";
import { useXp } from "@/lib/useXp";
import { listBookmarks } from "@/lib/bookmarks";
import { getCompletionCount } from "@/lib/progress";

/**
 * Admin Panel — local-only insights.
 * In production this reads from the analytics service / ClickHouse.
 * For now: surfaces what the platform looks like + this user's local stats.
 */
export default function AdminPage() {
  const xp = useXp();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0);

  useEffect(() => {
    setBookmarkCount(listBookmarks().length);
    let total = 0;
    for (const slug of Object.keys(STATIC_ROADMAPS)) {
      const ids = STATIC_ROADMAPS[slug].sections.flatMap((s) => s.topics.map((t) => t.id));
      total += getCompletionCount(slug, ids);
    }
    setCompletedTotal(total);
  }, [xp.xp]);

  const totalRoadmaps = Object.keys(STATIC_ROADMAPS).length;
  const totalTopics = Object.values(STATIC_ROADMAPS).reduce((s, r) => s + r.total_topics, 0);
  const totalSections = Object.values(STATIC_ROADMAPS).reduce((s, r) => s + r.sections.length, 0);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">
            <BeakerIcon className="w-3.5 h-3.5" /> Admin · single-user view
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            <span className="gradient-text">Platform Insights</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Content catalog + this device&apos;s local activity. Multi-user analytics arrive with the analytics service.
          </p>
        </motion.div>

        {/* Content stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Tile icon={<MapIcon className="w-5 h-5 text-indigo-300" />} label="Roadmaps" value={totalRoadmaps} hint="static + AI fallback" />
          <Tile icon={<ChartBarIcon className="w-5 h-5 text-violet-300" />} label="Sections" value={totalSections} hint="across all roadmaps" />
          <Tile icon={<BoltIcon className="w-5 h-5 text-emerald-300" />} label="Topics" value={totalTopics} hint="lessons available" />
          <Tile icon={<UsersIcon className="w-5 h-5 text-amber-300" />} label="Active devices" value={1} hint="this browser" />
        </div>

        {/* This device */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
            This device
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Mini label="XP earned" value={xp.xp} />
            <Mini label="Streak" value={`${xp.streakDays}d`} />
            <Mini label="Topics done" value={completedTotal} />
            <Mini label="Bookmarks" value={bookmarkCount} />
          </div>
          <div className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Lifetime XP events: {xp.history.length} · Last active: {xp.lastActiveDate || "never"}
          </div>
        </motion.div>

        {/* Roadmap catalog */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl mb-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
            Roadmap catalog
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                <tr>
                  <th className="text-left pb-2 font-bold">Slug</th>
                  <th className="text-left pb-2 font-bold">Title</th>
                  <th className="text-right pb-2 font-bold">Sections</th>
                  <th className="text-right pb-2 font-bold">Topics</th>
                  <th className="text-right pb-2 font-bold">Open</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {Object.entries(STATIC_ROADMAPS).map(([slug, rm]) => (
                  <tr key={slug} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="py-2 font-mono text-xs text-indigo-300">{slug}</td>
                    <td className="py-2" style={{ color: "var(--text)" }}>{rm.title}</td>
                    <td className="py-2 text-right" style={{ color: "var(--text-secondary)" }}>{rm.sections.length}</td>
                    <td className="py-2 text-right font-bold" style={{ color: "var(--text)" }}>{rm.total_topics}</td>
                    <td className="py-2 text-right">
                      <Link href={`/learn/roadmap/${slug}`} className="text-xs text-indigo-300 hover:text-indigo-200">
                        view →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent XP events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
            Recent XP events ({xp.history.length})
          </h3>
          {xp.history.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No XP events yet. Complete a topic to see activity here.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {xp.history.slice(0, 12).map((h, i) => (
                <li key={i} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="font-mono" style={{ color: "var(--text-muted)" }}>{h.date}</span>
                  <span style={{ color: "var(--text)" }}>{h.reason}</span>
                  <span className="font-bold text-indigo-300">+{h.xp} XP</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="p-4 rounded-2xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</div>
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid var(--border)" }}>
      <div className="text-lg font-bold" style={{ color: "var(--text)" }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
