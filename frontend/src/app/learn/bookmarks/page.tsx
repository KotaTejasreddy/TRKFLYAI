"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { listBookmarks, removeBookmark, subscribeBookmarks, type Bookmark } from "@/lib/bookmarks";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setBookmarks(listBookmarks());
    return subscribeBookmarks(setBookmarks);
  }, []);

  // Group by roadmap
  const byRoadmap = bookmarks.reduce<Record<string, Bookmark[]>>((acc, b) => {
    (acc[b.roadmap] ||= []).push(b);
    return acc;
  }, {});

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm transition-colors mb-6"
          style={{ color: "var(--text-secondary)" }}>
          <ArrowLeftIcon className="w-4 h-4" /> Back to LearnAI
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <BookmarkIcon className="w-7 h-7 text-amber-300" />
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Bookmarks</span>
          </h1>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Topics you pinned for later. {bookmarks.length} total.
        </p>

        {bookmarks.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3 opacity-40">📌</div>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              No bookmarks yet. Pin a topic from any roadmap to save it for later.
            </p>
            <Link href="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold">
              Browse roadmaps
            </Link>
          </div>
        )}

        <div className="space-y-8">
          <AnimatePresence>
            {Object.entries(byRoadmap).map(([slug, items]) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-xs uppercase tracking-wider font-bold mb-3"
                  style={{ color: "var(--text-muted)" }}>
                  {items[0].roadmapTitle}
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((b) => (
                      <motion.div
                        key={b.topicId}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl group"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                      >
                        <span className="text-xl">📘</span>
                        <Link
                          href={`/learn/roadmap/${b.roadmap}#${b.topicId}`}
                          className="flex-1 min-w-0"
                        >
                          <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                            {b.topicTitle}
                          </div>
                          <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {b.sectionTitle}
                          </div>
                        </Link>
                        <button
                          onClick={() => removeBookmark(b.roadmap, b.topicId)}
                          className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: "var(--text-muted)" }}
                          title="Remove"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
