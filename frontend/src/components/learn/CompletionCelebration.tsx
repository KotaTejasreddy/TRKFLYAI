"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Confetti from "@/components/ui/Confetti";
import { Roadmap, RoadmapTopic } from "@/types";

interface NextSuggestion {
  topic: RoadmapTopic;
  sectionTitle: string;
  isNewSection: boolean;
}

/** Find the next topic after (sectionId, topicId) within the roadmap. */
function getNext(roadmap: Roadmap, sectionId: string, topicId: string): NextSuggestion | null {
  const secIdx = roadmap.sections.findIndex((s) => s.id === sectionId);
  if (secIdx === -1) return null;
  const sec = roadmap.sections[secIdx];
  const topicIdx = sec.topics.findIndex((t) => t.id === topicId);
  if (topicIdx === -1) return null;

  if (topicIdx + 1 < sec.topics.length) {
    return { topic: sec.topics[topicIdx + 1], sectionTitle: sec.title, isNewSection: false };
  }
  if (secIdx + 1 < roadmap.sections.length) {
    const nextSec = roadmap.sections[secIdx + 1];
    if (nextSec.topics.length > 0) {
      return { topic: nextSec.topics[0], sectionTitle: nextSec.title, isNewSection: true };
    }
  }
  return null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  awardedXp: number;
  leveledUp: boolean;
  newLevel: number;
  topicTitle: string;
  roadmap: Roadmap;
  sectionId: string;
  topicId: string;
}

export default function CompletionCelebration({
  open, onClose, awardedXp, leveledUp, newLevel, topicTitle, roadmap, sectionId, topicId,
}: Props) {
  const [trigger, setTrigger] = useState(0);
  const next = getNext(roadmap, sectionId, topicId);

  useEffect(() => {
    if (open) setTrigger((t) => t + 1);
  }, [open]);

  return (
    <>
      <Confetti trigger={trigger} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative max-w-md w-full rounded-3xl p-8 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 0 60px rgba(99,102,241,0.35)",
              }}
            >
              {/* Trophy / level icon */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg"
              >
                {leveledUp ? "👑" : "✨"}
              </motion.div>

              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
                {leveledUp ? `Level ${newLevel}!` : "Topic complete"}
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                {leveledUp
                  ? `You just hit level ${newLevel}. You're on fire 🔥`
                  : <>You finished <span className="font-semibold" style={{ color: "var(--text)" }}>{topicTitle}</span></>}
              </p>

              {/* XP pill */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6"
              >
                +{awardedXp} XP earned
              </motion.div>

              {/* Up Next */}
              {next && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-left p-4 rounded-2xl mb-5"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                    {next.isNewSection ? `Next section · ${next.sectionTitle}` : "Up next"}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {next.topic.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {next.topic.description}
                  </div>
                </motion.div>
              )}

              {!next && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-2xl mb-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-sm font-semibold text-emerald-300">
                    You finished the entire roadmap
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Stay here
                </button>
                {next ? (
                  <button
                    onClick={() => { onClose(); /* parent decides scroll */ }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow"
                  >
                    Continue →
                  </button>
                ) : (
                  <Link
                    href="/learn"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold text-center"
                  >
                    Pick another roadmap
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
