"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon, BookmarkIcon, MapIcon } from "@heroicons/react/24/outline";
import { STATIC_ROADMAPS } from "@/lib/roadmaps";
import { listBookmarks } from "@/lib/bookmarks";

type Hit = {
  kind: "topic" | "roadmap" | "bookmark";
  label: string;
  sub: string;
  href: string;
  score: number;
};

/** Crude fuzzy: substring boost + word starts. Good enough for ~200 items. */
function score(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 1000;
  if (t.startsWith(q)) return 800;
  if (t.includes(` ${q}`)) return 600;
  if (t.includes(q)) return 400;
  // letter-by-letter match
  let i = 0, j = 0, hits = 0;
  while (i < q.length && j < t.length) {
    if (q[i] === t[j]) { i++; hits++; }
    j++;
  }
  return i === q.length ? hits * 10 : 0;
}

function buildIndex(): Hit[] {
  const out: Hit[] = [];
  for (const slug of Object.keys(STATIC_ROADMAPS)) {
    const rm = STATIC_ROADMAPS[slug];
    out.push({
      kind: "roadmap",
      label: rm.title,
      sub: `${rm.total_topics} topics · roadmap`,
      href: `/learn/roadmap/${slug}`,
      score: 0,
    });
    for (const sec of rm.sections) {
      for (const t of sec.topics) {
        out.push({
          kind: "topic",
          label: t.title,
          sub: `${rm.title} · ${sec.title}`,
          href: `/learn/roadmap/${slug}#${t.id}`,
          score: 0,
        });
      }
    }
  }
  return out;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  // Cmd/Ctrl+K opens; Esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input on open & reset state
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQ(""); setCursor(0);
    }
  }, [open]);

  const results = useMemo<Hit[]>(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      // Show bookmarks first, then a peek at roadmaps
      const bks = listBookmarks().slice(0, 5).map<Hit>((b) => ({
        kind: "bookmark",
        label: b.topicTitle,
        sub: `${b.roadmapTitle} · ${b.sectionTitle}`,
        href: `/learn/roadmap/${b.roadmap}#${b.topicId}`,
        score: 0,
      }));
      const roads = index.filter((h) => h.kind === "roadmap").slice(0, 7);
      return [...bks, ...roads];
    }
    return index
      .map((h) => ({ ...h, score: score(trimmed, h.label) + score(trimmed, h.sub) * 0.3 }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [q, index]);

  function activate(hit: Hit) {
    setOpen(false);
    router.push(hit.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter" && results[cursor]) { e.preventDefault(); activate(results[cursor]); }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] p-4"
        >
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ y: -16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 0 60px rgba(99,102,241,0.25)" }}
          >
            {/* Search row */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <MagnifyingGlassIcon className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setCursor(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search topics, roadmaps, bookmarks…"
                className="flex-1 bg-transparent outline-none text-sm font-medium"
                style={{ color: "var(--text)" }}
              />
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No matches. Try &quot;binary search&quot;, &quot;transformers&quot;, &quot;LoRA&quot;…
                </div>
              ) : (
                <ul>
                  {results.map((hit, i) => {
                    const active = i === cursor;
                    return (
                      <li key={`${hit.href}-${i}`}>
                        <button
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => activate(hit)}
                          className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors"
                          style={{ background: active ? "rgba(99,102,241,0.10)" : "transparent" }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                            style={{
                              background: hit.kind === "bookmark" ? "rgba(245,158,11,0.18)"
                                : hit.kind === "roadmap" ? "rgba(99,102,241,0.18)"
                                : "rgba(139,92,246,0.18)"
                            }}
                          >
                            {hit.kind === "bookmark"
                              ? <BookmarkIcon className="w-4 h-4 text-amber-300" />
                              : hit.kind === "roadmap"
                                ? <MapIcon className="w-4 h-4 text-indigo-300" />
                                : <span className="text-violet-300 text-xs">📘</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                              {hit.label}
                            </div>
                            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                              {hit.sub}
                            </div>
                          </div>
                          {active && (
                            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc" }}>
                              ↵
                            </kbd>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-4 py-2 text-[10px]"
              style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <span><kbd className="px-1 rounded" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>↑</kbd>
                <kbd className="ml-0.5 px-1 rounded" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>↓</kbd> navigate</span>
              <span><kbd className="px-1 rounded" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>↵</kbd> open</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
