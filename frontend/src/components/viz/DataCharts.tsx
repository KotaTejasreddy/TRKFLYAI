"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ParsedCsv } from "@/lib/csv";

/**
 * DataCharts — auto-picks the most informative charts from a parsed CSV
 * and renders them as pure SVG (no charting library).
 * Strategies:
 *  - Time-series line if there's a date column + numeric column
 *  - Histogram for each numeric column (binned)
 *  - Bar chart for low-cardinality categorical columns
 *  - All charts pure SVG, dark-mode tuned, theme-aware.
 */

interface Props {
  parsed: ParsedCsv;
  maxCharts?: number;
}

interface Numeric { name: string; values: number[]; rawIdx: number; }
interface Category { name: string; counts: { value: string; count: number }[]; rawIdx: number; }
interface DateCol { name: string; values: Date[]; rawIdx: number; }

function parseNumber(v: string): number | null {
  if (!v) return null;
  const cleaned = v.replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function categoryCounts(values: string[], topN = 8): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function extractNumerics(parsed: ParsedCsv): Numeric[] {
  const out: Numeric[] = [];
  parsed.columns.forEach((c, i) => {
    if (c.inferred_type !== "number") return;
    const values: number[] = [];
    for (const r of parsed.rows) {
      const n = parseNumber(r[i] ?? "");
      if (n !== null) values.push(n);
    }
    if (values.length >= 5) out.push({ name: c.name, values, rawIdx: i });
  });
  return out;
}

function extractCategories(parsed: ParsedCsv): Category[] {
  const out: Category[] = [];
  parsed.columns.forEach((c, i) => {
    // Treat as categorical if string or boolean with low cardinality
    const isCat = (c.inferred_type === "string" || c.inferred_type === "boolean")
      && c.unique_count >= 2 && c.unique_count <= 15;
    if (!isCat) return;
    const values = parsed.rows.map((r) => (r[i] ?? "").trim());
    const counts = categoryCounts(values);
    if (counts.length >= 2) out.push({ name: c.name, counts, rawIdx: i });
  });
  return out;
}

function extractDateCol(parsed: ParsedCsv): DateCol | null {
  for (let i = 0; i < parsed.columns.length; i++) {
    if (parsed.columns[i].inferred_type !== "date") continue;
    const values: Date[] = [];
    for (const r of parsed.rows) {
      const d = parseDate(r[i] ?? "");
      if (d) values.push(d);
    }
    if (values.length >= 5) return { name: parsed.columns[i].name, values, rawIdx: i };
  }
  return null;
}

/* ─────────── Histogram ─────────── */

function Histogram({ name, values }: { name: string; values: number[] }) {
  const { bins, max, min, maxCount, mean } = useMemo(() => {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const n = Math.min(12, Math.max(4, Math.floor(Math.sqrt(values.length))));
    const width = (max - min) / n || 1;
    const counts = new Array(n).fill(0);
    for (const v of values) {
      const idx = Math.min(n - 1, Math.floor((v - min) / width));
      counts[idx]++;
    }
    return {
      bins: counts.map((c, i) => ({ count: c, x0: min + i * width, x1: min + (i + 1) * width })),
      max, min, maxCount: Math.max(...counts), mean,
    };
  }, [values]);

  const W = 320, H = 110;
  const padX = 8, padY = 16;
  const cw = (W - padX * 2) / bins.length;

  return (
    <div className="p-4 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold font-mono truncate" style={{ color: "var(--text)" }}>{name}</span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          n={values.length} · μ={mean.toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
        <defs>
          <linearGradient id={`hgrad-${name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {bins.map((b, i) => {
          const h = maxCount === 0 ? 0 : (b.count / maxCount) * (H - padY * 2);
          const x = padX + i * cw;
          const y = H - padY - h;
          return (
            <motion.rect
              key={i}
              initial={{ height: 0, y: H - padY }}
              animate={{ height: h, y }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
              x={x + 1} width={cw - 2}
              fill={`url(#hgrad-${name})`}
              rx={2}
            >
              <title>{`${b.count} values in [${b.x0.toFixed(1)}, ${b.x1.toFixed(1)}]`}</title>
            </motion.rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

/* ─────────── Category bars ─────────── */

function CategoryBars({ name, counts }: { name: string; counts: { value: string; count: number }[] }) {
  const max = Math.max(...counts.map((c) => c.count));
  const total = counts.reduce((s, c) => s + c.count, 0);
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#22d3ee", "#a855f7"];
  return (
    <div className="p-4 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold font-mono truncate" style={{ color: "var(--text)" }}>{name}</span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {counts.length} categories
        </span>
      </div>
      <div className="space-y-1.5">
        {counts.map((c, i) => {
          const pct = (c.count / max) * 100;
          const sharePct = total > 0 ? ((c.count / total) * 100).toFixed(0) : "0";
          return (
            <div key={c.value}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="truncate" style={{ color: "var(--text-secondary)" }}>{c.value || "(empty)"}</span>
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>{c.count} · {sharePct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: colors[i % colors.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Time-series line ─────────── */

function TimeLine({ dateName, numName, dates, values }: { dateName: string; numName: string; dates: Date[]; values: number[] }) {
  // Sort by date, take pairs
  const pairs = useMemo(() => {
    const arr = dates.map((d, i) => ({ d, v: values[i] }))
      .filter((p) => p.v != null && !Number.isNaN(p.v))
      .sort((a, b) => a.d.getTime() - b.d.getTime());
    return arr;
  }, [dates, values]);

  if (pairs.length < 2) return null;
  const W = 320, H = 130;
  const padL = 30, padR = 8, padT = 12, padB = 24;
  const xs = pairs.map((p) => p.d.getTime());
  const ys = pairs.map((p) => p.v);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yRange = yMax - yMin || 1;

  const px = (x: number) => padL + ((x - xMin) / (xMax - xMin || 1)) * (W - padL - padR);
  const py = (y: number) => padT + (1 - (y - yMin) / yRange) * (H - padT - padB);

  const path = pairs.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.d.getTime()).toFixed(2)} ${py(p.v).toFixed(2)}`).join(" ");
  const area = `${path} L ${px(pairs[pairs.length - 1].d.getTime()).toFixed(2)} ${H - padB} L ${px(pairs[0].d.getTime()).toFixed(2)} ${H - padB} Z`;

  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const trend = ys[ys.length - 1] - ys[0];

  return (
    <div className="p-4 rounded-2xl col-span-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: "var(--text)" }}>
          <span className="font-mono">{numName}</span> over <span className="font-mono text-amber-300">{dateName}</span>
        </span>
        <span className={`text-[10px] font-bold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
        <defs>
          <linearGradient id={`lgrad-${numName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y gridlines */}
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={padL} x2={W - padR} y1={padT + t * (H - padT - padB)} y2={padT + t * (H - padT - padB)}
            stroke="rgba(255,255,255,0.08)" />
        ))}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          d={area} fill={`url(#lgrad-${numName})`} stroke="none"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          d={path} fill="none" stroke="#6366f1" strokeWidth="2"
        />
        {pairs.map((p, i) => (
          <circle key={i} cx={px(p.d.getTime())} cy={py(p.v)} r={2} fill="#a5b4fc">
            <title>{`${fmt(p.d)}: ${p.v.toFixed(2)}`}</title>
          </circle>
        ))}
        {/* X-axis labels */}
        <text x={padL} y={H - 6} fontSize="9" fill="rgba(255,255,255,0.5)">{fmt(pairs[0].d)}</text>
        <text x={W - padR} y={H - 6} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">{fmt(pairs[pairs.length - 1].d)}</text>
        {/* Y range */}
        <text x={padL - 4} y={padT + 4} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">{yMax.toFixed(1)}</text>
        <text x={padL - 4} y={H - padB} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">{yMin.toFixed(1)}</text>
      </svg>
    </div>
  );
}

/* ─────────── Main ─────────── */

export default function DataCharts({ parsed, maxCharts = 6 }: Props) {
  const numerics = useMemo(() => extractNumerics(parsed), [parsed]);
  const categories = useMemo(() => extractCategories(parsed), [parsed]);
  const dateCol = useMemo(() => extractDateCol(parsed), [parsed]);

  // Pair date + first numeric for a time series
  const timeSeries = dateCol && numerics.length > 0
    ? {
        dateName: dateCol.name,
        numName: numerics[0].name,
        dates: parsed.rows
          .map((r) => parseDate(r[dateCol.rawIdx] ?? ""))
          .filter((d): d is Date => d !== null),
        values: parsed.rows
          .map((r) => parseNumber(r[numerics[0].rawIdx] ?? ""))
          .filter((n): n is number => n !== null),
      }
    : null;

  // Build chart list
  type Slot = { kind: "ts" | "hist" | "cat"; key: string; render: () => React.ReactNode };
  const slots: Slot[] = [];
  if (timeSeries && timeSeries.dates.length >= 5 && timeSeries.values.length >= 5) {
    slots.push({
      kind: "ts", key: `ts-${timeSeries.numName}`,
      render: () => <TimeLine {...timeSeries} />,
    });
  }
  // Add categorical charts (up to 2)
  for (const c of categories.slice(0, 2)) {
    slots.push({
      kind: "cat", key: `cat-${c.name}`,
      render: () => <CategoryBars name={c.name} counts={c.counts} />,
    });
  }
  // Fill remaining with histograms of numeric cols (skip the one used in time series)
  const usedNum = timeSeries?.numName;
  for (const n of numerics) {
    if (slots.length >= maxCharts) break;
    if (n.name === usedNum) continue;
    slots.push({
      kind: "hist", key: `hist-${n.name}`,
      render: () => <Histogram name={n.name} values={n.values} />,
    });
  }

  if (slots.length === 0) {
    return (
      <div className="p-5 rounded-2xl text-center text-xs"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        No chartable columns detected — need at least one numeric or low-cardinality categorical column.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {slots.map((s) => <div key={s.key}>{s.render()}</div>)}
    </div>
  );
}
