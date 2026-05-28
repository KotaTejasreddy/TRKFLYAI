"use client";

import { motion } from "framer-motion";

interface Point { label: string; x: number; y: number; vec: [number, number, number]; }
interface Cluster {
  key: string;
  name: string;
  color: { dot: string; ring: string; glow: string; fill: string; text: string };
  ellipse: { cx: number; cy: number; rx: number; ry: number };
  points: Point[];
}

const CLUSTERS: Cluster[] = [
  {
    key: "royalty",
    name: "ROYALTY",
    color: { dot: "#22d3ee", ring: "rgba(34,211,238,0.5)", glow: "rgba(34,211,238,0.6)", fill: "rgba(34,211,238,0.08)", text: "#67e8f9" },
    ellipse: { cx: 0.20, cy: 0.30, rx: 110, ry: 65 },
    points: [
      { label: "King",   x: 0.18, y: 0.26, vec: [0.82, 0.14, 0.71] },
      { label: "Queen",  x: 0.28, y: 0.22, vec: [0.80, 0.18, 0.75] },
      { label: "Prince", x: 0.13, y: 0.36, vec: [0.77, 0.11, 0.69] },
      { label: "Crown",  x: 0.26, y: 0.38, vec: [0.74, 0.16, 0.72] },
    ],
  },
  {
    key: "food",
    name: "FOOD",
    color: { dot: "#f59e0b", ring: "rgba(245,158,11,0.5)", glow: "rgba(245,158,11,0.6)", fill: "rgba(245,158,11,0.08)", text: "#fde68a" },
    ellipse: { cx: 0.78, cy: 0.30, rx: 95, ry: 60 },
    points: [
      { label: "Pizza",  x: 0.74, y: 0.24, vec: [0.12, 0.91, 0.23] },
      { label: "Burger", x: 0.84, y: 0.32, vec: [0.18, 0.88, 0.20] },
      { label: "Pasta",  x: 0.72, y: 0.38, vec: [0.10, 0.84, 0.27] },
    ],
  },
  {
    key: "tech",
    name: "TECH",
    color: { dot: "#a855f7", ring: "rgba(168,85,247,0.5)", glow: "rgba(168,85,247,0.6)", fill: "rgba(168,85,247,0.08)", text: "#e9d5ff" },
    ellipse: { cx: 0.20, cy: 0.78, rx: 100, ry: 60 },
    points: [
      { label: "Python",  x: 0.14, y: 0.74, vec: [0.45, 0.22, 0.91] },
      { label: "Server",  x: 0.27, y: 0.72, vec: [0.41, 0.30, 0.88] },
      { label: "Cloud",   x: 0.19, y: 0.84, vec: [0.38, 0.28, 0.93] },
    ],
  },
  {
    key: "emotion",
    name: "EMOTION",
    color: { dot: "#ec4899", ring: "rgba(236,72,153,0.5)", glow: "rgba(236,72,153,0.6)", fill: "rgba(236,72,153,0.08)", text: "#fbcfe8" },
    ellipse: { cx: 0.78, cy: 0.78, rx: 110, ry: 60 },
    points: [
      { label: "Happy",   x: 0.72, y: 0.74, vec: [0.91, 0.85, 0.18] },
      { label: "Joy",     x: 0.84, y: 0.72, vec: [0.93, 0.82, 0.20] },
      { label: "Excited", x: 0.78, y: 0.86, vec: [0.88, 0.81, 0.22] },
    ],
  },
];

const W = 760, H = 460;
const px = (x: number) => x * W;
const py = (y: number) => y * H;

export default function EmbeddingsDemo() {
  return (
    <div className="space-y-5">
      {/* Vector space scatter */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.08), transparent 60%), linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.98))",
          border: "1px solid rgba(103,232,249,0.18)",
        }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64 sm:h-80 block">
          <defs>
            {CLUSTERS.map((c) => (
              <radialGradient key={`g-${c.key}`} id={`grad-${c.key}`}>
                <stop offset="0%" stopColor={c.color.dot} stopOpacity={1} />
                <stop offset="100%" stopColor={c.color.dot} stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>

          {/* Cluster ellipses */}
          {CLUSTERS.map((c) => (
            <ellipse key={`e-${c.key}`}
              cx={px(c.ellipse.cx)} cy={py(c.ellipse.cy)}
              rx={c.ellipse.rx} ry={c.ellipse.ry}
              fill={c.color.fill} stroke={c.color.ring} strokeWidth={1.2} strokeDasharray="5 5" />
          ))}

          {/* Cluster name labels */}
          {CLUSTERS.map((c, i) => {
            const labelOffset = i === 0 || i === 2 ? { dx: -90, dy: -55 } : { dx: 0, dy: -55 };
            return (
              <g key={`l-${c.key}`}>
                <rect
                  x={px(c.ellipse.cx) + labelOffset.dx}
                  y={py(c.ellipse.cy) + labelOffset.dy}
                  width={130} height={26} rx={6}
                  fill="rgba(2,6,23,0.92)" stroke={c.color.ring} strokeWidth={1} />
                <text
                  x={px(c.ellipse.cx) + labelOffset.dx + 65}
                  y={py(c.ellipse.cy) + labelOffset.dy + 18}
                  textAnchor="middle"
                  fontFamily="monospace" fontSize="11" fontWeight="bold"
                  fill={c.color.text} letterSpacing="2">
                  {c.name} CLUSTER
                </text>
              </g>
            );
          })}

          {/* Points */}
          {CLUSTERS.flatMap((c, ci) =>
            c.points.map((p, pi) => (
              <motion.g key={`p-${c.key}-${p.label}`}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (ci * 4 + pi) * 0.08, duration: 0.45 }}>
                <circle cx={px(p.x)} cy={py(p.y)} r={18} fill={`url(#grad-${c.key})`} opacity={0.45} />
                <circle cx={px(p.x)} cy={py(p.y)} r={6} fill={c.color.dot} />
                <circle cx={px(p.x)} cy={py(p.y)} r={2.5} fill="white" />
                <text x={px(p.x) + 11} y={py(p.y) - 6} fontFamily="ui-sans-serif" fontSize="12" fontWeight="bold" fill="white">
                  {p.label}
                </text>
              </motion.g>
            ))
          )}
        </svg>
      </div>

      {/* Vector DB cards — one per cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CLUSTERS.map((c, i) => (
          <motion.div key={`vc-${c.key}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-xl p-4 overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.98))",
              border: `1px solid ${c.color.ring}`,
            }}>
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-35"
              style={{ background: c.color.glow }} />
            <div className="relative">
              <div className="text-[10px] font-mono tracking-[0.18em] mb-3 uppercase"
                style={{ color: c.color.text }}>
                VECTOR · {c.name}
              </div>
              <pre className="font-mono text-[10px] sm:text-[11px] leading-relaxed whitespace-pre"
                style={{ color: "rgba(226,232,240,0.85)" }}>
{c.points.map((p) =>
`${p.label.padEnd(8)} [${p.vec.map((v) => v.toFixed(2)).join(", ")}]`
).join("\n")}
              </pre>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs sm:text-sm pt-2" style={{ color: "rgba(148,163,184,0.7)" }}>
        Tokens with similar meaning sit close together. Real models use 1024+ dimensions —
        we just can&apos;t visualise hyperspace.
      </p>
    </div>
  );
}
