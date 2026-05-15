"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PlayIcon, ArrowPathIcon, XMarkIcon, BeakerIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { runCode, debugError } from "@/lib/api";
import type { DebugResponse } from "@/types";

/**
 * Code playground:
 * - Browser execution: Python (Pyodide) / JavaScript (Function sandbox)
 * - Server execution: Java / C++ / Go (and a "server" toggle for Python/JS too)
 * - "Explain Error" button → AI debug agent
 */

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<unknown>;
    __pyodide?: unknown;
    __pyodideLoading?: Promise<unknown>;
  }
}

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type Lang = "python" | "javascript" | "java" | "cpp" | "go";
const LANG_LABELS: Record<Lang, string> = {
  python: "🐍 Python",
  javascript: "⚡ JavaScript",
  java: "☕ Java",
  cpp: "🔧 C++",
  go: "🐹 Go",
};
const BROWSER_RUNNABLE: Lang[] = ["python", "javascript"];

function detectLanguage(code: string): Lang {
  if (/\b(public\s+class|System\.out|public\s+static\s+void\s+main)/.test(code)) return "java";
  if (/#include\s*<|std::|cout\s*<<|int\s+main\s*\(/.test(code)) return "cpp";
  if (/^package\s+main|fmt\.Println|func\s+main/.test(code)) return "go";
  if (/\b(def |import |from .+ import|print\(|elif )/.test(code)) return "python";
  if (/\b(function |const |let |console\.|=>)/.test(code)) return "javascript";
  if (/:\s*\n\s+/.test(code)) return "python";
  return "javascript";
}

function loadPyodide(): Promise<unknown> {
  if (window.__pyodide) return Promise.resolve(window.__pyodide);
  if (window.__pyodideLoading) return window.__pyodideLoading;
  window.__pyodideLoading = (async () => {
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `${PYODIDE_URL}pyodide.js`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Pyodide loader"));
        document.head.appendChild(s);
      });
    }
    const py = await window.loadPyodide!({ indexURL: PYODIDE_URL });
    window.__pyodide = py;
    return py;
  })();
  return window.__pyodideLoading;
}

interface Props {
  initialCode: string;
  open: boolean;
  onClose: () => void;
}

export default function CodePlayground({ initialCode, open, onClose }: Props) {
  const [code, setCode] = useState(initialCode);
  const [lang, setLang] = useState<Lang>(() => detectLanguage(initialCode));
  const [runMode, setRunMode] = useState<"browser" | "server">(() =>
    BROWSER_RUNNABLE.includes(detectLanguage(initialCode)) ? "browser" : "server"
  );
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [bootMsg, setBootMsg] = useState("");
  const [hasError, setHasError] = useState(false);

  const [debug, setDebug] = useState<DebugResponse | null>(null);
  const [debugging, setDebugging] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(initialCode);
    const detected = detectLanguage(initialCode);
    setLang(detected);
    setRunMode(BROWSER_RUNNABLE.includes(detected) ? "browser" : "server");
  }, [initialCode]);

  // When user changes language to one not browser-runnable, force server mode
  useEffect(() => {
    if (!BROWSER_RUNNABLE.includes(lang) && runMode === "browser") {
      setRunMode("server");
    }
  }, [lang, runMode]);

  async function runBrowser() {
    if (lang === "python") {
      setBootMsg("Loading Python runtime…");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const py: any = await loadPyodide();
      setBootMsg("");
      let captured = "";
      py.setStdout({ batched: (s: string) => (captured += s + "\n") });
      py.setStderr({ batched: (s: string) => (captured += s + "\n") });
      try {
        await py.runPythonAsync(code);
        return { out: captured.trim() || "(no output)", err: false };
      } catch (e) {
        return { out: (captured + String(e)).trim(), err: true };
      }
    } else {
      const logs: string[] = [];
      const fakeConsole = {
        log: (...a: unknown[]) => logs.push(a.map(stringify).join(" ")),
        error: (...a: unknown[]) => logs.push("ERROR: " + a.map(stringify).join(" ")),
        warn: (...a: unknown[]) => logs.push("WARN: " + a.map(stringify).join(" ")),
      };
      try {
        const fn = new Function("console", code);
        const result = fn(fakeConsole);
        if (result !== undefined) logs.push(stringify(result));
        return { out: logs.join("\n") || "(no output)", err: false };
      } catch (e) {
        return { out: "ERROR: " + String(e), err: true };
      }
    }
  }

  async function runServer() {
    setBootMsg("Sending to server…");
    const { data, error } = await runCode({ language: lang, code, timeout: 5 });
    setBootMsg("");
    if (error || !data) {
      return { out: error || "Run failed.", err: true };
    }
    const parts: string[] = [];
    if (data.stdout) parts.push(data.stdout);
    if (data.stderr) parts.push(data.stderr);
    if (data.compile_error) parts.push("[Compile error]\n" + data.compile_error);
    parts.push(`\n[exit=${data.exit_code} · ${data.runtime_ms}ms${data.timed_out ? " · TIMED OUT" : ""}]`);
    return { out: parts.join("\n").trim() || "(no output)", err: !data.ok };
  }

  async function run() {
    setOutput("");
    setRunning(true);
    setHasError(false);
    setDebug(null);
    try {
      const res = runMode === "browser" ? await runBrowser() : await runServer();
      setOutput(res.out);
      setHasError(res.err);
    } finally {
      setRunning(false);
      setBootMsg("");
    }
  }

  async function explainError() {
    setDebugging(true);
    setDebug(null);
    const { data, error } = await debugError({
      code,
      error: output,
      language: lang,
      response_language: "English",
    });
    if (error || !data) {
      const msg = (error || "").toLowerCase();
      setDebug({
        success: false,
        explanation: msg.includes("quota") ? "Daily AI quota exhausted." : (error || "Debug failed."),
        likely_cause: "", suggested_fix: "", fixed_code: "",
      });
    } else {
      setDebug(data);
    }
    setDebugging(false);
  }

  function stringify(v: unknown): string {
    if (typeof v === "string") return v;
    try { return JSON.stringify(v); } catch { return String(v); }
  }

  function reset() {
    setCode(initialCode);
    setOutput("");
    setHasError(false);
    setDebug(null);
  }

  function applyFix() {
    if (debug?.fixed_code) {
      setCode(debug.fixed_code);
      setDebug(null);
      setOutput("");
      setHasError(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mt-3"
        >
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {/* Header — language picker + close */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Playground
              </span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="px-2 py-0.5 rounded-md text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                  <option key={l} value={l}>{LANG_LABELS[l]}</option>
                ))}
              </select>
              {/* Browser / Server toggle (only if browser is an option) */}
              {BROWSER_RUNNABLE.includes(lang) && (
                <div className="inline-flex rounded-md text-[10px] font-bold overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button
                    onClick={() => setRunMode("browser")}
                    className={`px-2 py-0.5 ${runMode === "browser" ? "bg-indigo-500 text-white" : ""}`}
                    style={runMode !== "browser" ? { background: "var(--bg-card)", color: "var(--text-secondary)" } : undefined}
                  >IN-BROWSER</button>
                  <button
                    onClick={() => setRunMode("server")}
                    className={`px-2 py-0.5 ${runMode === "server" ? "bg-indigo-500 text-white" : ""}`}
                    style={runMode !== "server" ? { background: "var(--bg-card)", color: "var(--text-secondary)" } : undefined}
                  >SERVER</button>
                </div>
              )}
              {!BROWSER_RUNNABLE.includes(lang) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 font-bold">
                  SERVER
                </span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={reset}
                  title="Reset to original code"
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  title="Close"
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor */}
            <textarea
              ref={taRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs leading-relaxed resize-y min-h-[180px] focus:outline-none"
              style={{
                background: "rgba(0,0,0,0.4)",
                color: "#e0e7ff",
                border: "none",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            />

            {/* Run bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 flex-wrap" style={{ background: "var(--bg-card)" }}>
              <button
                onClick={run}
                disabled={running}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all disabled:opacity-60"
              >
                {running ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {bootMsg || "Running…"}
                  </>
                ) : (
                  <><PlayIcon className="w-3.5 h-3.5" /> Run</>
                )}
              </button>
              {hasError && output && (
                <button
                  onClick={explainError}
                  disabled={debugging}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {debugging ? (
                    <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg> Asking AI…</>
                  ) : (
                    <><SparklesIcon className="w-3.5 h-3.5" /> Explain Error</>
                  )}
                </button>
              )}
              <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
                {runMode === "server"
                  ? "Runs on backend (5s timeout)"
                  : lang === "python"
                    ? "Pyodide loads ~5MB on first Python run"
                    : "Sandboxed in this tab"}
              </span>
            </div>

            {/* Output */}
            {output && (
              <div className="border-t" style={{ borderColor: "var(--border)" }}>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider font-bold flex items-center gap-2" style={{ color: "var(--text-muted)", background: "var(--bg-card)" }}>
                  Output
                  {hasError && <span className="text-red-400">· error</span>}
                </div>
                <pre
                  className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto"
                  style={{ background: "rgba(0,0,0,0.4)", color: hasError ? "#fca5a5" : "#86efac" }}
                >
                  {output}
                </pre>
              </div>
            )}

            {/* Debug agent panel */}
            <AnimatePresence>
              {debug && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <BeakerIcon className="w-4 h-4 text-rose-300" />
                      <span className="text-xs uppercase tracking-wider font-bold text-rose-300">Debug Agent</span>
                    </div>
                    {debug.explanation && (
                      <div className="text-sm mb-2" style={{ color: "var(--text)" }}>
                        <span className="text-rose-300 font-bold text-xs">▸ </span>
                        {debug.explanation}
                      </div>
                    )}
                    {debug.likely_cause && (
                      <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                        <span className="text-amber-300 font-bold">Likely cause: </span>
                        {debug.likely_cause}
                      </div>
                    )}
                    {debug.suggested_fix && (
                      <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                        <span className="text-emerald-400 font-bold">Fix: </span>
                        {debug.suggested_fix}
                      </div>
                    )}
                    {debug.fixed_code && (
                      <details className="mt-2">
                        <summary className="text-xs font-bold text-indigo-300 cursor-pointer">▸ Show fixed code</summary>
                        <pre className="mt-2 p-3 rounded-lg font-mono text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.5)", color: "#86efac" }}>
                          {debug.fixed_code}
                        </pre>
                        <button
                          onClick={applyFix}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
                        >
                          Apply fix to editor
                        </button>
                      </details>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
