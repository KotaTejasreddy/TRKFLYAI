"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNextSuggestion } from "@/lib/api";
import { GuideResponse } from "@/types";

interface Props {
  currentTopic: string;
  completedTopics: string[];
  language: string;
  onNavigateToTopic?: (topic: string) => void;
}

export default function GuideAgent({
  currentTopic,
  completedTopics,
  language,
  onNavigateToTopic,
}: Props) {
  const [guide, setGuide] = useState<GuideResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  async function fetchSuggestion() {
    setLoading(true);
    setVisible(true);
    const { data } = await getNextSuggestion({
      current_topic: currentTopic,
      completed_topics: completedTopics,
      language,
    });
    if (data) {
      setGuide(data);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Trigger */}
      {!visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={fetchSuggestion}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              {"🧭"}
            </span>
            <div className="text-left">
              <div className="text-sm font-semibold text-emerald-300">
                What should I learn next?
              </div>
              <div className="text-[10px] text-gray-500">
                AI Guide will suggest your best next step
              </div>
            </div>
            <svg
              className="w-5 h-5 text-emerald-400 ml-auto opacity-50 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
        </motion.button>
      )}

      {/* Guide response */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 space-y-4">
              {loading ? (
                <div className="flex items-center gap-3 py-4 justify-center text-gray-500 text-sm">
                  <svg
                    className="w-5 h-5 animate-spin text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  AI Guide is thinking...
                </div>
              ) : guide ? (
                <>
                  {/* Progress message */}
                  <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-300 font-medium">
                      {guide.progress_message}
                    </p>
                  </div>

                  {/* Next topic suggestion */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                      Recommended Next
                    </p>
                    <button
                      onClick={() => onNavigateToTopic?.(guide.next_topic)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {guide.next_topic}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {guide.reason}
                      </div>
                    </button>
                  </div>

                  {/* Motivation */}
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-400 italic">
                      {guide.motivation}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setVisible(false);
                      setGuide(null);
                    }}
                    className="w-full text-center text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Dismiss
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
