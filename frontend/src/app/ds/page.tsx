"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  CloudArrowUpIcon, DocumentTextIcon, BoltIcon, ExclamationTriangleIcon,
  BeakerIcon, ChartBarIcon, CpuChipIcon, SparklesIcon, ShieldCheckIcon,
  RocketLaunchIcon, EyeIcon, CurrencyDollarIcon, ArrowRightIcon, ArrowLeftIcon,
  ClipboardDocumentIcon, CheckIcon, CommandLineIcon, CodeBracketIcon,
  CubeIcon, ServerStackIcon, AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { parseCsvFile, type ParsedCsv } from "@/lib/csv";
import { analyzeDataset } from "@/lib/api";
import type { DsAnalyzeResponse, CodeArtifact } from "@/types";
import DataCharts from "@/components/viz/DataCharts";

/* ─── Agent timeline shown during analysis ─── */
const AGENTS = [
  { id: "biz",    name: "Business Understanding",   icon: "🎯", desc: "Decoding the question + KPIs" },
  { id: "data",   name: "Data Quality Agent",       icon: "🧹", desc: "Hunting nulls, dupes, leakage" },
  { id: "eda",    name: "EDA Agent",                icon: "🔍", desc: "Distributions, outliers, patterns" },
  { id: "stats",  name: "Statistics Agent",         icon: "📐", desc: "Correlations + hypothesis tests" },
  { id: "feat",  name: "Feature Engineering",      icon: "⚙️", desc: "Crafting predictive features" },
  { id: "ml",     name: "ML Strategy Agent",        icon: "🧠", desc: "Selecting models + reasoning" },
  { id: "hp",     name: "Hyperparameter Tuner",     icon: "🎛", desc: "Setting starting-point parameters" },
  { id: "sql",    name: "SQL Engineer",             icon: "🗄", desc: "Generating production queries" },
  { id: "code",   name: "Backend Engineer",         icon: "💻", desc: "Drafting FastAPI inference stub" },
  { id: "infra",  name: "Cloud Architect",          icon: "☁️", desc: "Dockerfile + Kubernetes manifests" },
  { id: "cost",   name: "Cost Optimizer",           icon: "💰", desc: "Budgeting + savings tips" },
  { id: "risk",   name: "Risk & Bias Auditor",      icon: "🛡", desc: "Detecting bias, leakage, drift" },
  { id: "ops",    name: "MLOps & Monitoring",       icon: "📡", desc: "Drift, retraining, alerts" },
  { id: "exec",   name: "Executive Synthesiser",    icon: "📋", desc: "Boardroom-ready summary" },
] as const;

const SAMPLE_QUESTIONS = [
  "Which customers are most likely to churn next month?",
  "Forecast next quarter's revenue per region.",
  "Detect fraudulent transactions in real-time.",
  "Predict patient readmission risk within 30 days.",
];

export default function DsWorkspacePage() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [analyzing, setAnalyzing] = useState(false);
  const [agentIdx, setAgentIdx] = useState(-1);
  const [result, setResult] = useState<DsAnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  async function handleFile(file: File) {
    setError("");
    if (!file.name.toLowerCase().match(/\.(csv|tsv|txt)$/)) {
      setError("Please upload a .csv or .tsv file.");
      return;
    }
    try {
      const p = await parseCsvFile(file);
      if (p.headers.length === 0) {
        setError("Couldn't read any columns from this file.");
        return;
      }
      setParsed(p);
      setFileName(file.name);
    } catch (e) {
      setError("Failed to parse the file: " + String(e));
    }
  }

  async function runAnalysis() {
    if (!parsed || !question.trim()) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    setAgentIdx(0);

    // Run the agent-timeline animation while the call is in flight.
    const totalAgents = AGENTS.length;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setAgentIdx((i) => Math.min(i + 1, totalAgents - 1));
    }, 1400);

    const { data, error: apiErr } = await analyzeDataset({
      file_name: fileName,
      business_question: question.trim(),
      row_count: parsed.total_rows,
      columns: parsed.columns,
      csv_preview: parsed.preview_text,
      response_language: language,
    });

    clearInterval(interval);
    // Ensure all agents shown as "done" before showing results
    const elapsed = Date.now() - startedAt;
    if (elapsed < 1400 * totalAgents) {
      await new Promise((r) => setTimeout(r, Math.min(1200, 1400 * totalAgents - elapsed)));
    }
    setAgentIdx(totalAgents);

    if (apiErr || !data) {
      const lower = (apiErr || "").toLowerCase();
      setError(lower.includes("quota") || lower.includes("429")
        ? "Daily AI quota exhausted. Try again later."
        : (apiErr || "Analysis failed."));
      setAnalyzing(false);
      return;
    }
    setResult(data);
    setAnalyzing(false);
  }

  function copyExec() {
    if (!result) return;
    navigator.clipboard.writeText(result.executive_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function reset() {
    setParsed(null);
    setFileName("");
    setQuestion("");
    setResult(null);
    setError("");
    setAgentIdx(-1);
    setAnalyzing(false);
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/products/omniscience-ds"
            className="inline-flex items-center gap-2 text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}>
            <ArrowLeftIcon className="w-4 h-4" /> Back to product page
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-2xl">
              🧠
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text">OMNISCIENCE DS</span>
              </h1>
              <p className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                Autonomous Data Scientist Workspace
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Drop a dataset, ask a business question. 9 specialist agents reason through it end-to-end —
            data quality, EDA, statistics, feature engineering, model selection, risk audit, deployment.
          </p>
        </motion.div>

        {/* Step 1 — Upload */}
        {!parsed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add("ring-2", "ring-indigo-500/60"); }}
              onDragLeave={() => dropRef.current?.classList.remove("ring-2", "ring-indigo-500/60")}
              onDrop={(e) => {
                e.preventDefault();
                dropRef.current?.classList.remove("ring-2", "ring-indigo-500/60");
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer rounded-3xl p-12 text-center transition-all hover:bg-white/[0.03]"
              style={{ background: "var(--bg-card)", border: "2px dashed var(--border)" }}
            >
              <input
                ref={fileRef} type="file" accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                Drop a CSV here
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Or click to browse · We parse the first 100 rows locally for profiling
              </p>
              <div className="inline-flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <span>CSV</span><span>·</span><span>TSV</span><span>·</span><span>TXT</span><span>·</span><span>up to ~5MB</span>
              </div>
            </div>
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2 — Data profile + question */}
        {parsed && !result && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* File summary chip */}
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <DocumentTextIcon className="w-5 h-5 text-indigo-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{fileName}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {parsed.total_rows.toLocaleString()} rows · {parsed.columns.length} columns · preview of {parsed.rows.length}
                </div>
              </div>
              <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Change file
              </button>
            </div>

            {/* Column profile preview */}
            <div className="p-5 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
                Columns inferred
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {parsed.columns.map((c) => {
                  const badgeColor = c.inferred_type === "number" ? "bg-emerald-500/20 text-emerald-300"
                    : c.inferred_type === "date" ? "bg-amber-500/20 text-amber-300"
                    : c.inferred_type === "boolean" ? "bg-pink-500/20 text-pink-300"
                    : c.inferred_type === "string" ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-white/10 text-gray-400";
                  return (
                    <div key={c.name}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                      <span className="font-mono font-semibold truncate flex-1" style={{ color: "var(--text)" }}>
                        {c.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                        {c.inferred_type}
                      </span>
                      {c.missing_count > 0 && (
                        <span className="text-[10px] text-amber-400" title="missing values">
                          {c.missing_count}∅
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto-generated chart preview */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-secondary)" }}>
                📊 Data preview · auto-charted
              </h3>
              <DataCharts parsed={parsed} maxCharts={6} />
            </div>

            {/* Question + lang + run */}
            <div className="p-5 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
                What's the business question?
              </h3>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Which customers are most likely to churn in the next 30 days?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold pt-1.5" style={{ color: "var(--text-muted)" }}>
                  Try:
                </span>
                {SAMPLE_QUESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuestion(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:bg-indigo-500/10"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
                  Report in:
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  {["English", "Telugu", "Hindi", "Tamil", "Spanish", "French", "German"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                <button
                  onClick={runAnalysis}
                  disabled={!question.trim()}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                >
                  <BoltIcon className="w-4 h-4" />
                  Run autonomous analysis
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3 — Agents working */}
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 p-5 rounded-2xl"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.25)" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-indigo-500/30 rounded-full" />
                  <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-300">Multi-agent reasoning in progress</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {AGENTS[Math.min(agentIdx, AGENTS.length - 1)]?.name}…
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {AGENTS.map((a, i) => {
                const done = i < agentIdx;
                const active = i === agentIdx;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: done ? "rgba(16,185,129,0.06)"
                        : active ? "rgba(99,102,241,0.10)"
                        : "var(--bg-card)",
                      border: `1px solid ${done ? "rgba(16,185,129,0.25)" : active ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: "var(--text)" }}>{a.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.desc}</div>
                    </div>
                    {done ? (
                      <CheckIcon className="w-5 h-5 text-emerald-400" />
                    ) : active ? (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:200ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:400ms]" />
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>queued</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 4 — Report */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {/* Data charts */}
              {parsed && (
                <Section icon={<ChartBarIcon className="w-4 h-4" />} title="Visual Data Patterns" tone="cyan" wide>
                  <DataCharts parsed={parsed} maxCharts={6} />
                </Section>
              )}

              {/* Executive summary */}
              <Section icon={<SparklesIcon className="w-4 h-4" />} title="Executive Summary" tone="indigo" wide
                action={
                  <button onClick={copyExec}
                    className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                }
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {result.executive_summary || result.problem_understanding}
                </p>
              </Section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Problem + assumptions */}
                <Section icon={<EyeIcon className="w-4 h-4" />} title="Problem & Assumptions" tone="violet">
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    {result.problem_understanding}
                  </p>
                  <Bullets items={result.assumptions} prefix="·" />
                </Section>

                {/* Data quality */}
                <Section icon={<ShieldCheckIcon className="w-4 h-4" />} title="Data Quality" tone="emerald"
                  headerExtra={
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      result.data_quality.score >= 80 ? "bg-emerald-500/20 text-emerald-300"
                      : result.data_quality.score >= 50 ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                    }`}>
                      {result.data_quality.score}/100
                    </span>
                  }
                >
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                    {result.data_quality.summary}
                  </p>
                  <Bullets items={result.data_quality.issues} prefix="⚠" />
                </Section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<ChartBarIcon className="w-4 h-4" />} title="EDA Findings" tone="cyan">
                  <Bullets items={result.eda_findings} prefix="◆" />
                </Section>
                <Section icon={<BeakerIcon className="w-4 h-4" />} title="Statistical Insights" tone="amber">
                  <Bullets items={result.statistical_insights} prefix="∑" />
                </Section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<CpuChipIcon className="w-4 h-4" />} title="Feature Engineering" tone="pink">
                  <Bullets items={result.feature_engineering} prefix="⚙" />
                </Section>
                <Section icon={<BoltIcon className="w-4 h-4" />} title="ML Approach" tone="indigo">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {result.ml_approach.problem_type && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                        {result.ml_approach.problem_type}
                      </span>
                    )}
                    {result.ml_approach.recommended_models.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10"
                        style={{ color: "var(--text-secondary)" }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {result.ml_approach.reasoning}
                  </p>
                </Section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<ExclamationTriangleIcon className="w-4 h-4" />} title="Risks" tone="red">
                  <Bullets items={result.risks} prefix="!" />
                </Section>
                <Section icon={<ShieldCheckIcon className="w-4 h-4" />} title="Bias Warnings" tone="amber">
                  <Bullets items={result.bias_warnings} prefix="⚖" />
                </Section>
              </div>

              <Section icon={<CurrencyDollarIcon className="w-4 h-4" />} title="Business Impact" tone="emerald" wide>
                <p className="text-sm mb-2" style={{ color: "var(--text)" }}>
                  {result.business_impact.summary}
                </p>
                {result.business_impact.estimated_value && (
                  <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-bold mb-3">
                    Est. value: {result.business_impact.estimated_value}
                  </div>
                )}
                {result.business_impact.kpis.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {result.business_impact.kpis.map((k) => (
                      <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                        📊 {k}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<RocketLaunchIcon className="w-4 h-4" />} title="Deployment Strategy" tone="violet">
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {result.deployment_strategy}
                  </p>
                </Section>
                <Section icon={<EyeIcon className="w-4 h-4" />} title="Monitoring Strategy" tone="cyan">
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {result.monitoring_strategy}
                  </p>
                </Section>
              </div>

              {/* Architecture diagram */}
              {result.architecture_diagram && (
                <Section icon={<CubeIcon className="w-4 h-4" />} title="Reference Architecture" tone="violet" wide>
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap p-3 rounded-lg overflow-x-auto"
                    style={{ background: "rgba(0,0,0,0.4)", color: "#e0e7ff" }}>
                    {result.architecture_diagram}
                  </pre>
                </Section>
              )}

              {/* Hyperparameters */}
              {result.hyperparameters && Object.keys(result.hyperparameters).length > 0 && (
                <Section icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} title="Hyperparameter Starting Point" tone="cyan" wide>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(result.hyperparameters).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>{k}</div>
                        <div className="text-sm font-mono font-bold mt-0.5" style={{ color: "var(--text)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* SQL queries */}
              {result.sql_queries && result.sql_queries.length > 0 && (
                <Section icon={<CommandLineIcon className="w-4 h-4" />} title="Production SQL Queries" tone="emerald" wide>
                  <div className="space-y-3">
                    {result.sql_queries.map((q, i) => <CodeBlock key={i} artifact={q} />)}
                  </div>
                </Section>
              )}

              {/* Production code */}
              {result.production_code && result.production_code.code && (
                <Section icon={<CodeBracketIcon className="w-4 h-4" />} title="Inference Service (Production)" tone="indigo" wide>
                  <CodeBlock artifact={result.production_code} />
                </Section>
              )}

              {/* Deployment artifacts */}
              {result.deployment_artifacts && result.deployment_artifacts.length > 0 && (
                <Section icon={<ServerStackIcon className="w-4 h-4" />} title="Deployment Manifests" tone="amber" wide>
                  <div className="space-y-3">
                    {result.deployment_artifacts.map((a, i) => <CodeBlock key={i} artifact={a} />)}
                  </div>
                </Section>
              )}

              {/* Cost estimate */}
              {result.cost_estimate && (result.cost_estimate.monthly_usd || result.cost_estimate.breakdown.length > 0) && (
                <Section icon={<CurrencyDollarIcon className="w-4 h-4" />} title="Cost Estimate" tone="emerald" wide>
                  {result.cost_estimate.monthly_usd && (
                    <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm font-bold mb-3">
                      💰 {result.cost_estimate.monthly_usd}
                    </div>
                  )}
                  {result.cost_estimate.breakdown.length > 0 && (
                    <>
                      <div className="text-[10px] uppercase tracking-wider font-bold mb-2 mt-2" style={{ color: "var(--text-muted)" }}>Breakdown</div>
                      <Bullets items={result.cost_estimate.breakdown} prefix="·" />
                    </>
                  )}
                  {result.cost_estimate.optimization_tips.length > 0 && (
                    <>
                      <div className="text-[10px] uppercase tracking-wider font-bold mb-2 mt-3" style={{ color: "var(--text-muted)" }}>Optimization tips</div>
                      <Bullets items={result.cost_estimate.optimization_tips} prefix="✦" />
                    </>
                  )}
                </Section>
              )}

              <Section icon={<ArrowRightIcon className="w-4 h-4" />} title="Next Steps" tone="indigo" wide>
                <ol className="space-y-1.5">
                  {result.next_steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text)" }}>
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1">{s}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  Run another analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

const TONE: Record<string, string> = {
  indigo:  "from-indigo-500/10 to-violet-500/10 border-indigo-500/25 text-indigo-300",
  violet:  "from-violet-500/10 to-purple-500/10 border-violet-500/25 text-violet-300",
  emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/25 text-emerald-300",
  cyan:    "from-cyan-500/10 to-sky-500/10 border-cyan-500/25 text-cyan-300",
  amber:   "from-amber-500/10 to-orange-500/10 border-amber-500/25 text-amber-300",
  pink:    "from-pink-500/10 to-rose-500/10 border-pink-500/25 text-pink-300",
  red:     "from-red-500/10 to-rose-500/10 border-red-500/30 text-red-300",
};

function Section({
  icon, title, tone, children, wide, action, headerExtra,
}: {
  icon: React.ReactNode; title: string; tone: keyof typeof TONE;
  children: React.ReactNode; wide?: boolean;
  action?: React.ReactNode; headerExtra?: React.ReactNode;
}) {
  const cls = TONE[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${cls.split(" ").slice(0, 2).join(" ")} border ${cls.split(" ")[2]} ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={cls.split(" ")[3]}>{icon}</span>
        <h3 className={`text-xs uppercase tracking-wider font-bold ${cls.split(" ")[3]}`}>
          {title}
        </h3>
        {headerExtra}
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </motion.div>
  );
}

function CodeBlock({ artifact }: { artifact: CodeArtifact }) {
  const [copied, setCopied] = useState(false);
  const langTone: Record<string, string> = {
    sql: "bg-emerald-500/15 text-emerald-300",
    python: "bg-indigo-500/15 text-indigo-300",
    yaml: "bg-amber-500/15 text-amber-300",
    dockerfile: "bg-cyan-500/15 text-cyan-300",
    bash: "bg-pink-500/15 text-pink-300",
  };
  const tone = langTone[artifact.language?.toLowerCase()] || "bg-white/10 text-gray-300";
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ background: "var(--bg-card)" }}>
        {artifact.language && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tone}`}>
            {artifact.language}
          </span>
        )}
        {artifact.title && (
          <span className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{artifact.title}</span>
        )}
        <button
          onClick={() => { navigator.clipboard.writeText(artifact.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="ml-auto text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          {copied ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto"
        style={{ background: "rgba(0,0,0,0.55)", color: "#86efac" }}>
        {artifact.code}
      </pre>
      {artifact.notes && (
        <div className="px-4 py-2 text-[11px]" style={{ background: "var(--bg-card)", color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
          {artifact.notes}
        </div>
      )}
    </div>
  );
}

function Bullets({ items, prefix }: { items: string[]; prefix: string }) {
  if (!items || items.length === 0) {
    return <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>None identified.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text)" }}>
          <span className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{prefix}</span>
          <span className="flex-1">{it}</span>
        </li>
      ))}
    </ul>
  );
}
