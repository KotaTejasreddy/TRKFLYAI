"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { solveDoubt } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  suggestions?: string[];
}

export default function DoubtSolver({
  contextTopic,
  language,
}: {
  contextTopic: string;
  language: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: question.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const { data, error } = await solveDoubt({
      question: question.trim(),
      context_topic: contextTopic,
      language,
    });

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      text: error || !data ? "Sorry, I couldn't process that. Try again!" : data.answer,
      suggestions: data?.follow_up_suggestions || [],
    };
    setMessages((m) => [...m, aiMsg]);
    setLoading(false);
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-indigo-500/40 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] rounded-2xl border border-white/10 bg-[#0d0d15]/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-sm">
                  {"🧠"}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Doubt Solver</h4>
                  <p className="text-[10px] text-gray-500">
                    Ask anything about {contextTopic}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">{"🤔"}</div>
                  <p className="text-gray-500 text-xs">
                    Got a doubt? Ask me anything!
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-200"
                        : "bg-white/5 border border-white/10 text-gray-300"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => ask(s)}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your doubt..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
