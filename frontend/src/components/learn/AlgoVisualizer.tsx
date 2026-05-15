"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Algorithm visualizer:
 * - Each algorithm produces a deterministic step list.
 * - Renderer paints a single step on canvas/SVG.
 * - Controls: play/pause, prev/next, scrubber.
 */

type AlgoKey =
  | "big-o"
  | "bubble-sort"
  | "binary-search"
  | "bst-insert"
  | "bfs";

interface VizSpec {
  key: AlgoKey;
  title: string;
  match: RegExp;
}

/* What subtopic titles map to which visualizer */
const SPECS: VizSpec[] = [
  { key: "big-o",         title: "Big-O Comparison",   match: /big.?o|notation|complexity/i },
  { key: "bubble-sort",   title: "Bubble Sort",        match: /bubble|sorting|sort/i },
  { key: "binary-search", title: "Binary Search",      match: /binary search|search algorithm/i },
  { key: "bst-insert",    title: "BST Insert",         match: /binary search tree|bst|tree/i },
  { key: "bfs",           title: "BFS Traversal",      match: /bfs|breadth.?first|graph traversal/i },
];

/** Resolve which visualizer (if any) matches a topic title. */
export function resolveViz(topicTitle: string): VizSpec | null {
  for (const s of SPECS) if (s.match.test(topicTitle)) return s;
  return null;
}

/* ───────────── Step generators ───────────── */

interface SortStep { arr: number[]; i: number; j: number; swapping: boolean; sorted: number[]; }
function genBubbleSteps(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ arr: [...a], i: -1, j: -1, swapping: false, sorted: [] }];
  const sorted: number[] = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...a], i, j, swapping: false, sorted: [...sorted] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ arr: [...a], i, j, swapping: true, sorted: [...sorted] });
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);
  steps.push({ arr: [...a], i: -1, j: -1, swapping: false, sorted });
  return steps;
}

interface BSStep { arr: number[]; lo: number; hi: number; mid: number; target: number; found: boolean; done: boolean; }
function genBSSteps(arr: number[], target: number): BSStep[] {
  const a = [...arr].sort((x, y) => x - y);
  const steps: BSStep[] = [];
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ arr: a, lo, hi, mid, target, found: a[mid] === target, done: false });
    if (a[mid] === target) {
      steps.push({ arr: a, lo, hi, mid, target, found: true, done: true });
      return steps;
    }
    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  steps.push({ arr: a, lo, hi, mid: -1, target, found: false, done: true });
  return steps;
}

interface TreeNode { v: number; l: TreeNode | null; r: TreeNode | null; x?: number; y?: number; }
interface BSTStep { root: TreeNode | null; inserting: number; path: number[]; done: boolean; }
function genBSTSteps(values: number[]): BSTStep[] {
  const steps: BSTStep[] = [];
  let root: TreeNode | null = null;
  for (const v of values) {
    const path: number[] = [];
    if (!root) {
      root = { v, l: null, r: null };
    } else {
      let cur = root;
      while (true) {
        path.push(cur.v);
        if (v < cur.v) {
          if (!cur.l) { cur.l = { v, l: null, r: null }; break; }
          cur = cur.l;
        } else {
          if (!cur.r) { cur.r = { v, l: null, r: null }; break; }
          cur = cur.r;
        }
      }
    }
    steps.push({ root: clone(root), inserting: v, path, done: true });
  }
  return steps;
}
function clone(n: TreeNode | null): TreeNode | null {
  if (!n) return null;
  return { v: n.v, l: clone(n.l), r: clone(n.r) };
}
function layoutTree(node: TreeNode | null, depth = 0, xRange: [number, number] = [0, 1]): void {
  if (!node) return;
  node.y = depth;
  node.x = (xRange[0] + xRange[1]) / 2;
  const mid = node.x;
  layoutTree(node.l, depth + 1, [xRange[0], mid]);
  layoutTree(node.r, depth + 1, [mid, xRange[1]]);
}

interface BFSStep { visited: number[]; current: number; queue: number[]; }
function genBFSSteps(adj: number[][], start: number): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited = new Set<number>([start]);
  const queue = [start];
  steps.push({ visited: [start], current: -1, queue: [...queue] });
  while (queue.length) {
    const cur = queue.shift()!;
    steps.push({ visited: [...visited], current: cur, queue: [...queue] });
    for (const n of adj[cur]) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
        steps.push({ visited: [...visited], current: cur, queue: [...queue] });
      }
    }
  }
  return steps;
}

/* ───────────── Renderers ───────────── */

function BubbleSortViz({ step }: { step: SortStep }) {
  const max = Math.max(...step.arr);
  return (
    <div className="flex items-end justify-center gap-1.5 h-56 px-4 py-3">
      {step.arr.map((v, idx) => {
        const isCompare = idx === step.j || idx === step.j + 1;
        const isSorted = step.sorted.includes(idx);
        let color = "from-indigo-500 to-violet-500";
        if (isSorted) color = "from-emerald-500 to-teal-500";
        else if (step.swapping && isCompare) color = "from-pink-500 to-rose-500";
        else if (isCompare) color = "from-amber-500 to-orange-500";
        return (
          <motion.div
            key={idx}
            layout
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`flex-1 max-w-[40px] rounded-t-md bg-gradient-to-t ${color} flex items-end justify-center pb-1`}
            style={{ height: `${(v / max) * 100}%` }}
          >
            <span className="text-[10px] font-bold text-white">{v}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function BinarySearchViz({ step }: { step: BSStep }) {
  return (
    <div className="px-4 py-6">
      <div className="text-center text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
        Looking for <span className="font-bold text-amber-300">{step.target}</span>
        {step.done && (step.found
          ? <span className="text-emerald-400 ml-2">✓ Found at index {step.mid}</span>
          : <span className="text-red-400 ml-2">✗ Not found</span>
        )}
      </div>
      <div className="flex justify-center gap-1.5 flex-wrap">
        {step.arr.map((v, idx) => {
          const inRange = idx >= step.lo && idx <= step.hi;
          const isMid = idx === step.mid;
          let color = "bg-white/5 text-gray-500 border border-white/10";
          if (isMid) color = "bg-gradient-to-br from-pink-500 to-rose-500 text-white border border-pink-300 shadow-lg shadow-pink-500/40";
          else if (inRange) color = "bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-white border border-indigo-400/40";
          return (
            <motion.div
              key={idx}
              animate={{ scale: isMid ? 1.15 : 1 }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${color}`}
            >
              {v}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BSTViz({ step }: { step: BSTStep }) {
  if (!step.root) return null;
  const root = step.root;
  layoutTree(root);
  // Collect nodes & edges
  const nodes: { v: number; x: number; y: number; onPath: boolean }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  function walk(n: TreeNode | null) {
    if (!n) return;
    nodes.push({ v: n.v, x: n.x!, y: n.y!, onPath: step.path.includes(n.v) });
    if (n.l) { edges.push({ x1: n.x!, y1: n.y!, x2: n.l.x!, y2: n.l.y! }); walk(n.l); }
    if (n.r) { edges.push({ x1: n.x!, y1: n.y!, x2: n.r.x!, y2: n.r.y! }); walk(n.r); }
  }
  walk(root);
  const W = 600, H = 220;
  const px = (x: number) => 30 + x * (W - 60);
  const py = (y: number) => 30 + y * 50;
  return (
    <div className="px-4 py-3">
      <div className="text-center text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
        Inserting <span className="font-bold text-amber-300">{step.inserting}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
        {edges.map((e, i) => (
          <line key={i} x1={px(e.x1)} y1={py(e.y1)} x2={px(e.x2)} y2={py(e.y2)}
            stroke="rgba(99,102,241,0.4)" strokeWidth={2} />
        ))}
        {nodes.map((n, i) => {
          const isInserted = n.v === step.inserting;
          const onPath = n.onPath && !isInserted;
          const fill = isInserted ? "url(#newNode)" : onPath ? "url(#pathNode)" : "url(#defaultNode)";
          return (
            <motion.g key={i} initial={{ scale: isInserted ? 0 : 1 }} animate={{ scale: 1 }} style={{ transformOrigin: `${px(n.x)}px ${py(n.y)}px` }}>
              <circle cx={px(n.x)} cy={py(n.y)} r={18} fill={fill} stroke="white" strokeWidth={isInserted ? 2 : 1} strokeOpacity={0.4} />
              <text x={px(n.x)} y={py(n.y) + 4} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{n.v}</text>
            </motion.g>
          );
        })}
        <defs>
          <radialGradient id="defaultNode"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#4338ca" /></radialGradient>
          <radialGradient id="pathNode"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></radialGradient>
          <radialGradient id="newNode"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function BFSViz({ step }: { step: BFSStep }) {
  // 6-node graph layout (hex-ish)
  const positions: [number, number][] = [
    [0.5, 0.1], [0.2, 0.4], [0.8, 0.4], [0.1, 0.8], [0.5, 0.85], [0.9, 0.8],
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  ];
  const W = 600, H = 240;
  const px = (x: number) => 30 + x * (W - 60);
  const py = (y: number) => 25 + y * (H - 50);
  return (
    <div className="px-4 py-3">
      <div className="text-center text-xs mb-2 flex justify-center gap-3 flex-wrap" style={{ color: "var(--text-secondary)" }}>
        <span>Visited: <span className="text-emerald-400 font-bold">{step.visited.join(", ")}</span></span>
        <span>Queue: <span className="text-amber-300 font-bold">[{step.queue.join(", ")}]</span></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        {edges.map(([a, b], i) => (
          <line key={i} x1={px(positions[a][0])} y1={py(positions[a][1])} x2={px(positions[b][0])} y2={py(positions[b][1])}
            stroke="rgba(99,102,241,0.35)" strokeWidth={2} />
        ))}
        {positions.map(([x, y], i) => {
          const isVisited = step.visited.includes(i);
          const isCurrent = step.current === i;
          const fill = isCurrent ? "#f43f5e" : isVisited ? "#10b981" : "#312e81";
          return (
            <g key={i}>
              <circle cx={px(x)} cy={py(y)} r={20} fill={fill} stroke="white" strokeOpacity={0.3} strokeWidth={1.5} />
              <text x={px(x)} y={py(y) + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{i}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BigOViz() {
  // Static comparison chart: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
  const labels = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"];
  const colors = ["#10b981", "#22d3ee", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const W = 600, H = 240;
  const xs = Array.from({ length: 50 }, (_, i) => i + 1);
  const fns = [
    () => 1,
    (n: number) => Math.log2(n + 1),
    (n: number) => n,
    (n: number) => n * Math.log2(n + 1),
    (n: number) => n * n,
    (n: number) => Math.pow(2, n / 8), // damped
  ];
  const maxY = 200;
  const px = (x: number) => 30 + (x / xs.length) * (W - 50);
  const py = (y: number) => H - 25 - (Math.min(y, maxY) / maxY) * (H - 50);
  return (
    <div className="px-4 py-3">
      <div className="text-center text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
        Operations vs input size
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
        {/* axes */}
        <line x1={30} y1={H - 25} x2={W - 20} y2={H - 25} stroke="rgba(255,255,255,0.2)" />
        <line x1={30} y1={20} x2={30} y2={H - 25} stroke="rgba(255,255,255,0.2)" />
        {fns.map((f, i) => {
          const path = xs.map((n, idx) => `${idx === 0 ? "M" : "L"} ${px(n)} ${py(f(n))}`).join(" ");
          return <path key={i} d={path} stroke={colors[i]} strokeWidth={2.5} fill="none" />;
        })}
        {labels.map((l, i) => (
          <g key={i}>
            <rect x={W - 110} y={28 + i * 22} width={10} height={10} fill={colors[i]} rx={2} />
            <text x={W - 95} y={37 + i * 22} fill="white" fontSize="11" fontWeight="600">{l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ───────────── Main component ───────────── */

interface Props {
  spec: VizSpec;
  open: boolean;
  onClose: () => void;
}

const SAMPLE_ARRAY = [5, 2, 8, 1, 9, 3, 7, 4, 6];
const BS_TARGET = 7;
const BST_INSERTS = [50, 30, 70, 20, 40, 60, 80, 10, 35];
const BFS_ADJ = [[1, 2], [0, 3, 4], [0, 4, 5], [1], [1, 2], [2]];

export default function AlgoVisualizer({ spec, open, onClose }: Props) {
  type Step = SortStep | BSStep | BSTStep | BFSStep | null;
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps: Step[] = (() => {
    switch (spec.key) {
      case "bubble-sort":   return genBubbleSteps(SAMPLE_ARRAY);
      case "binary-search": return genBSSteps(SAMPLE_ARRAY, BS_TARGET);
      case "bst-insert":    return genBSTSteps(BST_INSERTS);
      case "bfs":           return genBFSSteps(BFS_ADJ, 0);
      case "big-o":         return [null]; // static
    }
  })();

  const current = steps[Math.min(stepIdx, steps.length - 1)];

  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      setPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setStepIdx((s) => {
        if (s >= steps.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, spec.key === "bubble-sort" ? 280 : 700);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, steps.length, spec.key]);

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
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                🎬 {spec.title} Visualizer
              </span>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Visualization */}
            <div style={{ background: "rgba(0,0,0,0.3)" }}>
              {spec.key === "big-o"         && <BigOViz />}
              {spec.key === "bubble-sort"   && current && <BubbleSortViz step={current as SortStep} />}
              {spec.key === "binary-search" && current && <BinarySearchViz step={current as BSStep} />}
              {spec.key === "bst-insert"    && current && <BSTViz step={current as BSTStep} />}
              {spec.key === "bfs"           && current && <BFSViz step={current as BFSStep} />}
            </div>

            {/* Controls — hidden for static viz */}
            {spec.key !== "big-o" && (
              <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "var(--bg-card)" }}>
                <button
                  onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                  disabled={stepIdx === 0}
                  className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPlaying(!playing)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs font-semibold"
                >
                  {playing ? <><PauseIcon className="w-3.5 h-3.5" /> Pause</> : <><PlayIcon className="w-3.5 h-3.5" /> Play</>}
                </button>
                <button
                  onClick={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))}
                  disabled={stepIdx >= steps.length - 1}
                  className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setStepIdx(0); setPlaying(false); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  title="Restart"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={steps.length - 1}
                  value={stepIdx}
                  onChange={(e) => { setPlaying(false); setStepIdx(Number(e.target.value)); }}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {stepIdx + 1} / {steps.length}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
