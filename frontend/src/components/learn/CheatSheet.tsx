"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getCheatSheet } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  topic: string;
  subtopic?: string;
  language: string;
}

export default function CheatSheet({ open, onClose, topic, subtopic, language }: Props) {
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [oneLiner, setOneLiner] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(""); setBullets([]); setOneLiner("");
      const { data, error: e } = await getCheatSheet({ topic, subtopic, language });
      if (cancelled) return;
      if (e || !data) {
        const msg = (e || "").toLowerCase();
        if (msg.includes("quota") || msg.includes("429")) {
          setError("Daily AI quota exhausted. Try again later.");
        } else {
          setError(e || "Couldn't generate cheat sheet.");
        }
      } else {
        setBullets(data.bullets || []);
        setOneLiner(data.one_liner || "");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, topic, subtopic, language]);

  function copy() {
    const text = [oneLiner, "", ...bullets.map((b) => `• ${b}`)].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 0 60px rgba(245,158,11,0.25)" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-500/15 to-orange-500/15"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">📋</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Cheat Sheet</div>
                <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                  {subtopic || topic}
                </div>
              </div>
              <button
                onClick={copy}
                disabled={loading || bullets.length === 0}
                className="p-2 rounded-lg transition-colors disabled:opacity-40"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                title="Copy"
              >
                {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex flex-col items-center gap-3 py-12 text-sm" style={{ color: "var(--text-muted)" }}>
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-amber-500/30 rounded-full" />
                    <div className="absolute inset-0 w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  Distilling the topic into a cheat sheet…
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <>
                  {oneLiner && (
                    <div
                      className="p-3 rounded-xl mb-4 text-sm font-semibold italic"
                      style={{ background: "rgba(245,158,11,0.08)", color: "var(--text)", border: "1px solid rgba(245,158,11,0.2)" }}
                    >
                      “{oneLiner}”
                    </div>
                  )}
                  <ul className="space-y-2.5">
                    {bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-3 text-sm leading-relaxed"
                        style={{ color: "var(--text)" }}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                          {i + 1}
                        </span>
                        <span className="flex-1">{b}</span>
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
