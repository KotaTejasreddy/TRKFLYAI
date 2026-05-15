"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TrophyIcon, FireIcon, BoltIcon, UserGroupIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { useXp } from "@/lib/useXp";
import { getLevel } from "@/lib/xp";
import { listBookmarks } from "@/lib/bookmarks";

/**
 * Community page — leaderboard + study groups (mock data + your real XP).
 * In a multi-user backend this would query the leaderboard service.
 * For now: 8 simulated peers + you, sorted by XP.
 */

const PEERS = [
  { handle: "neha_codes",     avatar: "🐍", xp: 720, streak: 14 },
  { handle: "arjun_dsa",      avatar: "🧩", xp: 540, streak: 9 },
  { handle: "priya_ml",       avatar: "🧠", xp: 420, streak: 6 },
  { handle: "rohan_systems",  avatar: "⚙️", xp: 380, streak: 5 },
  { handle: "ananya_ai",      avatar: "✨", xp: 320, streak: 12 },
  { handle: "vikram_js",      avatar: "⚡", xp: 280, streak: 4 },
  { handle: "sneha_deep",     avatar: "🔬", xp: 240, streak: 3 },
  { handle: "kunal_agentic",  avatar: "🤖", xp: 180, streak: 2 },
];

const STUDY_GROUPS = [
  { id: "dsa-pre-placement", name: "DSA Pre-Placement Sprint", emoji: "🧩", members: 142, today: 23, focus: "DSA", color: "from-emerald-500 to-teal-500" },
  { id: "ml-from-scratch",   name: "ML From Scratch",          emoji: "🧠", members: 96,  today: 14, focus: "Machine Learning", color: "from-violet-500 to-purple-500" },
  { id: "agents-builders",   name: "Agentic AI Builders",      emoji: "🤖", members: 71,  today: 19, focus: "Agentic AI", color: "from-orange-500 to-red-500" },
  { id: "js-foundations",    name: "JS Foundations",           emoji: "⚡", members: 58,  today: 8,  focus: "JavaScript", color: "from-yellow-500 to-amber-500" },
];

export default function CommunityPage() {
  const xp = useXp();
  const [me, setMe] = useState({ xp: 0, streak: 0, bookmarks: 0 });

  useEffect(() => {
    setMe({ xp: xp.xp, streak: xp.streakDays, bookmarks: listBookmarks().length });
  }, [xp.xp, xp.streakDays]);

  // Combine peers + you, sort
  const board = [
    ...PEERS,
    { handle: "you (me)", avatar: "🚀", xp: me.xp, streak: me.streak, isMe: true as const },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Community</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Climb the weekly leaderboard. Join a study group. Learn together.
          </p>
        </motion.div>

        {/* You snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl mb-8 flex items-center gap-4"
          style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.10), rgba(139,92,246,0.10))", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl flex-shrink-0">
            🚀
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider font-bold text-indigo-300">You</div>
            <div className="text-base font-bold" style={{ color: "var(--text)" }}>
              Rank #{board.findIndex((b) => "isMe" in b && b.isMe) + 1} of {board.length}
            </div>
          </div>
          <Inline label="XP" value={me.xp} icon={<BoltIcon className="w-4 h-4 text-indigo-300" />} />
          <Inline label="Streak" value={me.streak} icon={<FireIcon className="w-4 h-4 text-orange-300" />} />
          <Inline label="Pinned" value={me.bookmarks} icon={<BookmarkIcon className="w-4 h-4 text-amber-300" />} />
        </motion.div>

        {/* Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 p-5 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                This week
              </h3>
            </div>
            <ol className="space-y-1">
              {board.map((b, i) => {
                const isMe = "isMe" in b && b.isMe;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <motion.li
                    key={b.handle}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{
                      background: isMe ? "rgba(99,102,241,0.10)" : "transparent",
                      border: isMe ? "1px solid rgba(99,102,241,0.30)" : "1px solid transparent",
                    }}
                  >
                    <div className="w-7 text-center text-sm font-bold" style={{ color: "var(--text-muted)" }}>
                      {medal || `${i + 1}`}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {b.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: isMe ? "var(--text)" : "var(--text)" }}>
                        {b.handle} {isMe && <span className="text-[10px] text-indigo-300 ml-1">YOU</span>}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        Lv {getLevel(b.xp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                      <FireIcon className="w-3.5 h-3.5" /> {b.streak}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-300 min-w-[60px] justify-end">
                      <BoltIcon className="w-3.5 h-3.5" /> {b.xp}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>

          {/* Study groups */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <UserGroupIcon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Study groups
              </h3>
            </div>
            {STUDY_GROUPS.map((g) => (
              <motion.div
                key={g.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl cursor-pointer relative overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${g.color} opacity-15 blur-2xl`} />
                <div className="flex items-center gap-3 mb-2 relative">
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{g.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{g.focus}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] relative">
                  <span style={{ color: "var(--text-secondary)" }}>{g.members} members</span>
                  <span className="text-emerald-400 font-bold">● {g.today} active today</span>
                </div>
              </motion.div>
            ))}
            <p className="text-[10px] text-center pt-1" style={{ color: "var(--text-muted)" }}>
              Multi-user sync coming soon · these are demo groups
            </p>
          </motion.div>
        </div>

        {/* Try mock interview cross-link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-5 rounded-2xl text-center"
          style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.10), rgba(236,72,153,0.10))", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <div className="text-2xl mb-2">💼</div>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
            Climb faster with mock interviews
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            Each interview earns XP whether you pass or not. Practice = points.
          </div>
          <Link
            href="/learn/interview"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold"
          >
            Start a mock interview →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function Inline({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="hidden sm:block text-right">
      <div className="flex items-center gap-1 text-xs font-bold justify-end" style={{ color: "var(--text)" }}>
        {icon} {value}
      </div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
