"use client";

import { motion } from "framer-motion";

interface Point { label: string; x: number; y: number; vec: [number, number, number]; }

const ROYALTY: Point[] = [
  { label: "King",   x: 0.32, y: 0.30, vec: [0.82, 0.14, 0.71] },
  { label: "Queen",  x: 0.42, y: 0.24, vec: [0.80, 0.18, 0.75] },
  { label: "Prince", x: 0.26, y: 0.42, vec: [0.77, 0.11, 0.69] },
  { label: "Crown",  x: 0.40, y: 0.40, vec: [0.74, 0.16, 0.72] },
];
const FOOD: Point[] = [
  { label: "Pizza",  x: 0.74, y: 0.36, vec: [0.12, 0.91, 0.23] },
  { label: "Burger", x: 0.82, y: 0.46, vec: [0.18, 0.88, 0.20] },
  { label: "Pasta",  x: 0.70, y: 0.52, vec: [0.10, 0.84, 0.27] },
];

const W = 720, H = 360;
const px = (x: number) => x * W;
const py = (y: number) => y * H;

export default function EmbeddingsDemo() {
  return (
    <div className="space-y-5">
      {/* Vector space scatter */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
          border: "1px solid rgba(34,211,238,0.16)",
        }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56 sm:h-72 block">
          {/* Cluster ellipses */}
          <ellipse cx={px(0.34)} cy={py(0.36)} rx={110} ry={70}
            fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} strokeDasharray="4 4" />
          <ellipse cx={px(0.76)} cy={py(0.44)} rx={95} ry={65}
            fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.4)" strokeWidth={1} strokeDasharray="4 4" />

          {/* Cluster labels */}
          <g>
            <rect x={px(0.10)} y={py(0.10)} width={140} height={26} rx={6}
              fill="rgba(15,23,42,0.85)" stroke="rgba(34,211,238,0.4)" />
            <text x={px(0.10) + 70} y={py(0.10) + 18} textAnchor="middle"
              fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#67e8f9" letterSpacing="2">
              ROYALTY CLUSTER
            </text>
          </g>
          <g>
            <rect x={px(0.66)} y={py(0.78)} width={140} height={26} rx={6}
              fill="rgba(15,23,42,0.85)" stroke="rgba(168,85,247,0.4)" />
            <text x={px(0.66) + 70} y={py(0.78) + 18} textAnchor="middle"
              fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#e9d5ff" letterSpacing="2">
              FOOD CLUSTER
            </text>
          </g>

          {/* Royalty points */}
          {ROYALTY.map((p, i) => (
            <motion.g key={`r-${p.label}`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.4 }}>
              <circle cx={px(p.x)} cy={py(p.y)} r={12} fill="#22d3ee" opacity={0.25} />
              <circle cx={px(p.x)} cy={py(p.y)} r={6} fill="#22d3ee" />
              <text x={px(p.x) + 12} y={py(p.y) - 8} fontFamily="ui-sans-serif" fontSize="13" fontWeight="bold" fill="white">
                {p.label}
              </text>
            </motion.g>
          ))}

          {/* Food points */}
          {FOOD.map((p, i) => (
            <motion.g key={`f-${p.label}`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (ROYALTY.length + i) * 0.12, duration: 0.4 }}>
              <circle cx={px(p.x)} cy={py(p.y)} r={12} fill="#a855f7" opacity={0.25} />
              <circle cx={px(p.x)} cy={py(p.y)} r={6} fill="#a855f7" />
              <text x={px(p.x) + 12} y={py(p.y) - 8} fontFamily="ui-sans-serif" fontSize="13" fontWeight="bold" fill="white">
                {p.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Vector DB cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <VectorCard title="VECTOR DB: MEANING GROUP A" tone="cyan" points={ROYALTY} />
        <VectorCard title="VECTOR DB: MEANING GROUP B" tone="violet" points={FOOD} />
      </div>

      <p className="text-xs sm:text-sm pt-2" style={{ color: "rgba(148,163,184,0.7)" }}>
        Tokens with similar meaning sit close together. Real models use 1024+ dimensions,
        not 3 — we just can't visualise hyperspace.
      </p>
    </div>
  );
}

function VectorCard({ title, tone, points }: { title: string; tone: "cyan" | "violet"; points: Point[] }) {
  const cyan = tone === "cyan";
  return (
    <div className="rounded-xl p-4"
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
        border: `1px solid ${cyan ? "rgba(34,211,238,0.25)" : "rgba(168,85,247,0.25)"}`,
      }}>
      <div className="text-[10px] font-mono tracking-[0.18em] mb-3 uppercase"
        style={{ color: cyan ? "rgba(103,232,249,0.85)" : "rgba(233,213,255,0.85)" }}>
        {title}
      </div>
      <pre className="font-mono text-[11px] sm:text-xs leading-relaxed whitespace-pre"
        style={{ color: "rgba(226,232,240,0.85)" }}>
{points.map((p) =>
`${p.label.padEnd(7)} [${p.vec.map((v) => v.toFixed(2)).join(", ")}]`
).join("\n")}
      </pre>
    </div>
  );
}
