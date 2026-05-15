"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  CloudArrowUpIcon, DocumentTextIcon, BoltIcon, ExclamationTriangleIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon,
  ChartBarIcon, CurrencyDollarIcon, UsersIcon, MegaphoneIcon, CubeIcon,
  CogIcon, EyeIcon, SparklesIcon, ArrowRightIcon, ArrowLeftIcon,
  ClipboardDocumentIcon, CheckIcon, LightBulbIcon, FlagIcon,
  CommandLineIcon, BellAlertIcon, ChatBubbleLeftRightIcon, PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { parseCsvFile, type ParsedCsv } from "@/lib/csv";
import { analyzeBusinessIntelligence } from "@/lib/api";
import type { BiAnalyzeResponse, KpiItem, ActionItem, SqlArtifact, DashboardWidget, AlertRule, ForecastSpec } from "@/types";
import DataCharts from "@/components/viz/DataCharts";

const AGENTS = [
  { id: "biz",       name: "Business Understanding",   icon: "🎯", desc: "Decoding goal + stakeholders" },
  { id: "kpi",       name: "KPI Definition Agent",     icon: "📊", desc: "Building the KPI panel" },
  { id: "dq",        name: "Data Quality Auditor",     icon: "🧹", desc: "Validating completeness" },
  { id: "trend",     name: "Trend Analyst",            icon: "📈", desc: "Detecting movement + seasonality" },
  { id: "customer",  name: "Customer Analyst",         icon: "👥", desc: "Segmenting + behavior" },
  { id: "product",   name: "Product Analyst",          icon: "📦", desc: "Feature + adoption signals" },
  { id: "finance",   name: "Financial Analyst",        icon: "💰", desc: "Revenue, cost, margin" },
  { id: "marketing", name: "Marketing Analyst",        icon: "📣", desc: "Channels + conversion" },
  { id: "ops",       name: "Operations Analyst",       icon: "⚙️", desc: "Throughput + efficiency" },
  { id: "rca",       name: "Root-Cause Investigator",  icon: "🔍", desc: "Why KPIs moved" },
  { id: "anomaly",   name: "Anomaly Detector",         icon: "🚨", desc: "Spike + dip + outlier scanner" },
  { id: "forecast",  name: "Forecasting Agent",        icon: "🔮", desc: "Short-term outlook + method" },
  { id: "sql",       name: "SQL Engineer",             icon: "🗄", desc: "Production analytics queries" },
  { id: "dash",      name: "Dashboard Engineer",       icon: "📺", desc: "Widget + chart specifications" },
  { id: "alert",     name: "Alerting Architect",       icon: "🔔", desc: "Real-time alert rules" },
  { id: "nlp",       name: "Conversational BI Agent",  icon: "💬", desc: "Natural-language query designer" },
  { id: "exec",      name: "Executive Synthesiser",    icon: "📋", desc: "Board-ready brief" },
] as const;

const SAMPLE_QUESTIONS = [
  "What's driving the recent revenue trend and what should we do?",
  "Find our highest-value customer segments + how to grow them.",
  "Audit marketing channels — where is CAC hurting us?",
  "Identify product features with the strongest retention impact.",
];

const INDUSTRIES = ["", "SaaS", "Retail / E-commerce", "Fintech", "Healthcare", "Media", "Logistics", "EdTech", "Manufacturing", "Marketplace"];

export default function BiWorkspacePage() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [industry, setIndustry] = useState("");
  const [language, setLanguage] = useState("English");
  const [analyzing, setAnalyzing] = useState(false);
  const [agentIdx, setAgentIdx] = useState(-1);
  const [result, setResult] = useState<BiAnalyzeResponse | null>(null);
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

    const totalAgents = AGENTS.length;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setAgentIdx((i) => Math.min(i + 1, totalAgents - 1));
    }, 1100);

    const { data, error: apiErr } = await analyzeBusinessIntelligence({
      file_name: fileName,
      business_question: question.trim(),
      industry,
      row_count: parsed.total_rows,
      columns: parsed.columns,
      csv_preview: parsed.preview_text,
      response_language: language,
    });

    clearInterval(interval);
    const elapsed = Date.now() - startedAt;
    if (elapsed < 1100 * totalAgents) {
      await new Promise((r) => setTimeout(r, Math.min(1000, 1100 * totalAgents - elapsed)));
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
    setIndustry("");
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
          <Link href="/products"
            className="inline-flex items-center gap-2 text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}>
            <ArrowLeftIcon className="w-4 h-4" /> Back to products
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-2xl">
              ☀️
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text">HELIOS BI</span>
              </h1>
              <p className="text-xs uppercase tracking-wider font-bold text-amber-300">
                Autonomous Business Intelligence Workspace
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Drop business data, ask a strategic question. 12 specialist analyst agents reason through KPIs,
            customer behavior, financials, marketing, operations, and produce a board-ready brief with action items.
          </p>
        </motion.div>

        {/* Step 1 — Upload */}
        {!parsed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add("ring-2", "ring-amber-500/60"); }}
              onDragLeave={() => dropRef.current?.classList.remove("ring-2", "ring-amber-500/60")}
              onDrop={(e) => {
                e.preventDefault();
                dropRef.current?.classList.remove("ring-2", "ring-amber-500/60");
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
                Drop a business dataset
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                CRM exports, sales records, product analytics, financial CSVs — anything tabular
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

        {/* Step 2 — Question + industry */}
        {parsed && !result && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <DocumentTextIcon className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{fileName}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {parsed.total_rows.toLocaleString()} rows · {parsed.columns.length} columns
                </div>
              </div>
              <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Change file
              </button>
            </div>

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
                        <span className="text-[10px] text-amber-400">{c.missing_count}∅</span>
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

            <div className="p-5 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
                Strategic question
              </h3>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is driving the drop in monthly revenue and which actions should we prioritize?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold pt-1.5" style={{ color: "var(--text-muted)" }}>Try:</span>
                {SAMPLE_QUESTIONS.map((s) => (
                  <button key={s}
                    onClick={() => setQuestion(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:bg-amber-500/10"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                    Industry
                  </label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i || "— Any —"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                    Report language
                  </label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    {["English", "Telugu", "Hindi", "Tamil", "Spanish", "French", "German"].map((l) =>
                      <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <button
                  onClick={runAnalysis}
                  disabled={!question.trim()}
                  className="self-end inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                >
                  <BoltIcon className="w-4 h-4" />
                  Run analytics
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
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))", border: "1px solid rgba(245,158,11,0.25)" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-amber-500/30 rounded-full" />
                  <div className="absolute inset-0 w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-300">Analytics ecosystem reasoning</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {AGENTS[Math.min(agentIdx, AGENTS.length - 1)]?.name}…
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AGENTS.map((a, i) => {
                const done = i < agentIdx;
                const active = i === agentIdx;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: done ? "rgba(16,185,129,0.06)"
                        : active ? "rgba(245,158,11,0.12)"
                        : "var(--bg-card)",
                      border: `1px solid ${done ? "rgba(16,185,129,0.25)" : active ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{a.name}</div>
                      <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{a.desc}</div>
                    </div>
                    {done ? (
                      <CheckIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : active ? (
                      <div className="flex gap-1 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:200ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:400ms]" />
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold flex-shrink-0" style={{ color: "var(--text-muted)" }}>queued</div>
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
              {/* Executive Summary */}
              <Section icon={<SparklesIcon className="w-4 h-4" />} title="Executive Summary" tone="amber" wide
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
                  {result.executive_summary || result.business_understanding}
                </p>
              </Section>

              {/* KPI panel */}
              {result.kpis.length > 0 && (
                <Section icon={<ChartBarIcon className="w-4 h-4" />} title="KPI Panel" tone="indigo" wide>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.kpis.map((k, i) => <KpiCard key={i} kpi={k} />)}
                  </div>
                </Section>
              )}

              {/* Data charts */}
              {parsed && (
                <Section icon={<ChartBarIcon className="w-4 h-4" />} title="Visual Data Patterns" tone="cyan" wide>
                  <DataCharts parsed={parsed} maxCharts={6} />
                </Section>
              )}

              {/* Trends */}
              <Section icon={<ArrowTrendingUpIcon className="w-4 h-4" />} title="Trend Analysis" tone="cyan" wide>
                <Bullets items={result.trend_analysis} prefix="📈" />
              </Section>

              {/* Insight categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<UsersIcon className="w-4 h-4" />} title="Customer Insights" tone="violet">
                  <Bullets items={result.customer_insights} prefix="◆" />
                </Section>
                <Section icon={<CubeIcon className="w-4 h-4" />} title="Product Insights" tone="indigo">
                  <Bullets items={result.product_insights} prefix="◆" />
                </Section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<CurrencyDollarIcon className="w-4 h-4" />} title="Financial Insights" tone="emerald">
                  <Bullets items={result.financial_insights} prefix="$" />
                </Section>
                <Section icon={<MegaphoneIcon className="w-4 h-4" />} title="Marketing Insights" tone="pink">
                  <Bullets items={result.marketing_insights} prefix="📢" />
                </Section>
              </div>

              <Section icon={<CogIcon className="w-4 h-4" />} title="Operational Insights" tone="cyan" wide>
                <Bullets items={result.operational_insights} prefix="⚙" />
              </Section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<EyeIcon className="w-4 h-4" />} title="Root-Cause Analysis" tone="violet">
                  <Bullets items={result.root_cause_analysis} prefix="?" />
                </Section>
                <Section icon={<ExclamationTriangleIcon className="w-4 h-4" />} title="Anomalies" tone="red">
                  <Bullets items={result.anomalies} prefix="!" />
                </Section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section icon={<FlagIcon className="w-4 h-4" />} title="Risks" tone="red">
                  <Bullets items={result.risks} prefix="!" />
                </Section>
                <Section icon={<LightBulbIcon className="w-4 h-4" />} title="Opportunities" tone="emerald">
                  <Bullets items={result.opportunities} prefix="✦" />
                </Section>
              </div>

              <Section icon={<ArrowTrendingUpIcon className="w-4 h-4" />} title="Forecasts" tone="amber" wide>
                <Bullets items={result.forecasts} prefix="→" />
              </Section>

              <Section icon={<FlagIcon className="w-4 h-4" />} title="Strategic Recommendations" tone="indigo" wide>
                <Bullets items={result.strategic_recommendations} prefix="★" />
              </Section>

              <Section icon={<ChartBarIcon className="w-4 h-4" />} title="Dashboard Recommendations" tone="cyan" wide>
                <Bullets items={result.dashboard_recommendations} prefix="📊" />
              </Section>

              {/* SQL queries */}
              {result.sql_queries && result.sql_queries.length > 0 && (
                <Section icon={<CommandLineIcon className="w-4 h-4" />} title="Production SQL Queries" tone="emerald" wide>
                  <div className="space-y-3">
                    {result.sql_queries.map((q, i) => <SqlCard key={i} q={q} />)}
                  </div>
                </Section>
              )}

              {/* Dashboard widget specs */}
              {result.dashboard_widgets && result.dashboard_widgets.length > 0 && (
                <Section icon={<PresentationChartLineIcon className="w-4 h-4" />} title="Dashboard Widget Specs" tone="indigo" wide>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.dashboard_widgets.map((w, i) => <WidgetCard key={i} w={w} />)}
                  </div>
                </Section>
              )}

              {/* Alert rules */}
              {result.alert_rules && result.alert_rules.length > 0 && (
                <Section icon={<BellAlertIcon className="w-4 h-4" />} title="Real-Time Alert Rules" tone="red" wide>
                  <div className="space-y-2">
                    {result.alert_rules.map((a, i) => <AlertCard key={i} a={a} />)}
                  </div>
                </Section>
              )}

              {/* Forecast specs */}
              {result.forecast_specs && result.forecast_specs.length > 0 && (
                <Section icon={<ArrowTrendingUpIcon className="w-4 h-4" />} title="Forecast Specifications" tone="amber" wide>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.forecast_specs.map((f, i) => <ForecastCard key={i} f={f} />)}
                  </div>
                </Section>
              )}

              {/* NLP queries (Conversational BI) */}
              {result.nlp_queries && result.nlp_queries.length > 0 && (
                <Section icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />} title="Conversational BI · Try asking" tone="violet" wide>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.nlp_queries.map((q, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg text-sm flex items-start gap-2"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                        <span className="text-violet-300 mt-0.5">💬</span>
                        <span className="flex-1">&ldquo;{q}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Action items */}
              {result.action_items.length > 0 && (
                <Section icon={<ArrowRightIcon className="w-4 h-4" />} title="Action Items" tone="emerald" wide>
                  <div className="space-y-2">
                    {result.action_items.map((a, i) => <ActionCard key={i} item={a} index={i} />)}
                  </div>
                </Section>
              )}

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

/* ─── small components ─── */

function KpiCard({ kpi }: { kpi: KpiItem }) {
  const TrendIcon = kpi.trend === "up" ? ArrowTrendingUpIcon
    : kpi.trend === "down" ? ArrowTrendingDownIcon
    : MinusIcon;
  const trendColor = kpi.trend === "up" ? "text-emerald-400"
    : kpi.trend === "down" ? "text-red-400"
    : "text-gray-400";
  const healthClass = kpi.health === "good" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : kpi.health === "warning" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : kpi.health === "critical" ? "bg-red-500/15 text-red-300 border-red-500/30"
    : "bg-white/5 text-gray-400 border-white/10";
  return (
    <div className="p-4 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-2 mb-2">
        <div className="text-[10px] uppercase tracking-wider font-bold flex-1" style={{ color: "var(--text-muted)" }}>
          {kpi.name}
        </div>
        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
      </div>
      <div className="text-xl font-bold mb-1.5" style={{ color: "var(--text)" }}>
        {kpi.current_value || "—"}
      </div>
      {kpi.health && (
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${healthClass} mb-2`}>
          {kpi.health}
        </span>
      )}
      {kpi.notes && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{kpi.notes}</p>
      )}
    </div>
  );
}

function ActionCard({ item, index }: { item: ActionItem; index: number }) {
  const priColor = item.priority === "high" ? "bg-red-500/15 text-red-300 border-red-500/30"
    : item.priority === "medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      className="flex gap-3 p-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
    >
      <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-300 flex-shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>
          {item.action}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {item.priority && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priColor}`}>
              {item.priority}
            </span>
          )}
          {item.owner && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium">
              {item.owner}
            </span>
          )}
          {item.impact && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              → {item.impact}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
  icon, title, tone, children, wide, action,
}: {
  icon: React.ReactNode; title: string; tone: keyof typeof TONE;
  children: React.ReactNode; wide?: boolean; action?: React.ReactNode;
}) {
  const cls = TONE[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${cls.split(" ").slice(0, 2).join(" ")} border ${cls.split(" ")[2]} ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={cls.split(" ")[3]}>{icon}</span>
        <h3 className={`text-xs uppercase tracking-wider font-bold ${cls.split(" ")[3]}`}>{title}</h3>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </motion.div>
  );
}

function SqlCard({ q }: { q: SqlArtifact }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ background: "var(--bg-card)" }}>
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">SQL</span>
        <span className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{q.title}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(q.sql); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="ml-auto text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          {copied ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {q.purpose && (
        <div className="px-4 py-1.5 text-[11px] italic" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          → {q.purpose}
        </div>
      )}
      <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto"
        style={{ background: "rgba(0,0,0,0.55)", color: "#86efac" }}>
        {q.sql}
      </pre>
    </div>
  );
}

function WidgetCard({ w }: { w: DashboardWidget }) {
  const chartIcon: Record<string, string> = {
    line: "📈", bar: "📊", pie: "🥧", kpi_card: "🔢",
    table: "📋", gauge: "🌡", funnel: "🌪", heatmap: "🔥",
  };
  const ico = chartIcon[w.chart_type] || "📊";
  return (
    <div className="p-3 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{ico}</span>
        <span className="text-sm font-bold flex-1 truncate" style={{ color: "var(--text)" }}>{w.title}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
          {w.chart_type}
        </span>
      </div>
      <div className="text-[11px] mb-1.5" style={{ color: "var(--text-secondary)" }}>
        <span className="font-mono">{w.metric}</span>
        {w.dimensions.length > 0 && (
          <span> · grouped by <span className="font-mono">{w.dimensions.join(", ")}</span></span>
        )}
      </div>
      {w.refresh && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">
          ↻ {w.refresh}
        </span>
      )}
    </div>
  );
}

function AlertCard({ a }: { a: AlertRule }) {
  const sev = a.severity.toLowerCase();
  const sevClass = sev === "critical" ? "bg-red-500/15 text-red-300 border-red-500/30"
    : sev === "warning" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
  return (
    <div className="p-3 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">🔔</span>
        <span className="text-sm font-bold flex-1 truncate" style={{ color: "var(--text)" }}>{a.name}</span>
        {a.severity && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${sevClass}`}>
            {a.severity}
          </span>
        )}
        {a.channel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">
            #{a.channel}
          </span>
        )}
      </div>
      <div className="text-xs mb-1" style={{ color: "var(--text)" }}>
        <span className="font-mono text-emerald-400">{a.metric}</span>
        <span style={{ color: "var(--text-secondary)" }}> {a.condition}</span>
      </div>
      {a.rationale && (
        <div className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
          why: {a.rationale}
        </div>
      )}
    </div>
  );
}

function ForecastCard({ f }: { f: ForecastSpec }) {
  return (
    <div className="p-3 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">🔮</span>
        <span className="text-sm font-bold flex-1 truncate" style={{ color: "var(--text)" }}>{f.metric}</span>
        {f.method && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
            {f.method}
          </span>
        )}
      </div>
      {f.horizon && (
        <div className="text-[11px] mb-1" style={{ color: "var(--text-secondary)" }}>
          horizon: <span className="font-mono">{f.horizon}</span>
        </div>
      )}
      {f.expected_outcome && (
        <div className="text-xs" style={{ color: "var(--text)" }}>
          {f.expected_outcome}
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
