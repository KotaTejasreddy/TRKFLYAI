"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon, CurrencyRupeeIcon, FireIcon, BoltIcon,
  ChartBarIcon, ArrowTrendingUpIcon, LockClosedIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/components/providers/AuthProvider";

interface Stats {
  generated_at: string;
  users: { total: number; signups_24h: number; signups_7d: number; signups_30d: number };
  plans: { trial: number; monthly: number; quarterly: number; yearly: number; expired: number; none: number };
  active: { trial: number; paid: number; total_active: number };
  revenue_inr: { total: number; last_24h: number; last_7d: number; last_30d: number; payments_count: number };
  conversion: { paid_customers: number; conversion_pct: number };
  recent_signups: { email: string; handle: string; plan: string; created_at: string; auth_provider: string }[];
  recent_payments: { email: string; plan: string; amount: number; paid_at: string; mock: boolean }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminStatsPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setError("You're signed in, but this dashboard is only visible to the admin account configured on the backend (ADMIN_EMAIL env var).");
      } else if (res.status === 503) {
        setError("The admin dashboard isn't configured yet. Set the ADMIN_EMAIL env var on Render to your account email.");
      } else if (!res.ok) {
        setError(`Failed to load (status ${res.status})`);
      } else {
        setStats(await res.json());
      }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.push("/login?next=/admin/stats"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  if (authLoading || loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading stats…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <div className="p-6 rounded-2xl text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <LockClosedIcon className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>Admin only</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { users, plans, active, revenue_inr, conversion, recent_signups, recent_payments } = stats;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              <span className="gradient-text">Stats</span>
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Generated {new Date(stats.generated_at).toLocaleString()}
            </p>
          </div>
          <button onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh
          </button>
        </motion.div>

        {/* Top KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Tile icon={<UsersIcon className="w-5 h-5 text-indigo-300" />}
            label="Total users" value={users.total}
            sub={`+${users.signups_24h} today · +${users.signups_7d} this week`} />
          <Tile icon={<CurrencyRupeeIcon className="w-5 h-5 text-emerald-300" />}
            label="Total revenue" value={`₹${revenue_inr.total.toLocaleString("en-IN")}`}
            sub={`+₹${revenue_inr.last_24h} · 24h`} />
          <Tile icon={<BoltIcon className="w-5 h-5 text-amber-300" />}
            label="Active subscribers" value={active.paid}
            sub={`+ ${active.trial} on trial`} />
          <Tile icon={<ArrowTrendingUpIcon className="w-5 h-5 text-pink-300" />}
            label="Conversion" value={`${conversion.conversion_pct}%`}
            sub={`${conversion.paid_customers} paid customers`} />
        </div>

        {/* Plan breakdown + Revenue trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <Panel icon={<ChartBarIcon className="w-4 h-4 text-indigo-300" />} title="Plan breakdown">
            <div className="space-y-2">
              {([
                ["Trial",     plans.trial,     "amber"],
                ["Monthly",   plans.monthly,   "indigo"],
                ["Quarterly", plans.quarterly, "violet"],
                ["Yearly",    plans.yearly,    "emerald"],
                ["Expired",   plans.expired,   "muted"],
              ] as const).map(([label, count, hue]) => (
                <PlanRow key={label} label={label} count={count} total={users.total || 1} hue={hue} />
              ))}
            </div>
          </Panel>

          <Panel icon={<CurrencyRupeeIcon className="w-4 h-4 text-emerald-300" />} title="Revenue (₹ INR)">
            <div className="grid grid-cols-2 gap-2">
              <RevTile label="Last 24h"  value={revenue_inr.last_24h}  hue="cyan" />
              <RevTile label="Last 7d"   value={revenue_inr.last_7d}   hue="emerald" />
              <RevTile label="Last 30d"  value={revenue_inr.last_30d}  hue="violet" />
              <RevTile label="All time"  value={revenue_inr.total}     hue="pink" />
            </div>
            <p className="text-[10px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
              {revenue_inr.payments_count} payment event{revenue_inr.payments_count !== 1 ? "s" : ""} total
            </p>
          </Panel>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel icon={<FireIcon className="w-4 h-4 text-amber-300" />} title="Recent signups">
            {recent_signups.length === 0 ? (
              <Empty msg="No users yet." />
            ) : (
              <ul className="space-y-1.5 text-xs">
                {recent_signups.map((u, i) => (
                  <li key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {(u.handle?.[0] || u.email[0] || "?").toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold" style={{ color: "var(--text)" }}>
                        {u.handle || u.email.split("@")[0]}
                      </div>
                      <div className="truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {u.email}
                      </div>
                    </div>
                    {u.auth_provider === "google" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 uppercase">G</span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      u.plan === "trial" ? "bg-amber-500/15 text-amber-300"
                      : u.plan === "expired" ? "bg-white/5 text-gray-500"
                      : "bg-emerald-500/15 text-emerald-300"
                    }`}>{u.plan}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel icon={<CurrencyRupeeIcon className="w-4 h-4 text-emerald-300" />} title="Recent payments">
            {recent_payments.length === 0 ? (
              <Empty msg="No payments yet." />
            ) : (
              <ul className="space-y-1.5 text-xs">
                {recent_payments.map((p, i) => (
                  <li key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="font-mono font-bold text-emerald-300 w-14">
                      ₹{p.amount}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold" style={{ color: "var(--text)" }}>
                        {p.email}
                      </div>
                      <div className="truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {p.plan} · {new Date(p.paid_at).toLocaleString()}
                      </div>
                    </div>
                    {p.mock && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">MOCK</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="mt-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          For website traffic (page views, unique visitors): enable <strong style={{ color: "var(--text-secondary)" }}>Vercel Analytics</strong> on your Vercel dashboard →{" "}
          <Link href="/admin" className="text-indigo-300 hover:underline">Admin home</Link>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

function Tile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </motion.div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PlanRow({ label, count, total, hue }: { label: string; count: number; total: number; hue: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const colors: Record<string, string> = {
    amber:   "linear-gradient(90deg, #f59e0b, #fb923c)",
    indigo:  "linear-gradient(90deg, #6366f1, #818cf8)",
    violet:  "linear-gradient(90deg, #a855f7, #c084fc)",
    emerald: "linear-gradient(90deg, #10b981, #34d399)",
    muted:   "linear-gradient(90deg, #475569, #64748b)",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: "var(--text)" }}>{label}</span>
        <span className="font-mono" style={{ color: "var(--text-muted)" }}>{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: colors[hue] }} />
      </div>
    </div>
  );
}

function RevTile({ label, value, hue }: { label: string; value: number; hue: string }) {
  const colors: Record<string, string> = {
    cyan:    "rgba(34,211,238,0.10)",
    emerald: "rgba(16,185,129,0.10)",
    violet:  "rgba(168,85,247,0.10)",
    pink:    "rgba(236,72,153,0.10)",
  };
  return (
    <div className="p-3 rounded-xl" style={{ background: colors[hue], border: "1px solid var(--border)" }}>
      <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-base font-bold" style={{ color: "var(--text)" }}>
        ₹{value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-xs italic text-center py-4" style={{ color: "var(--text-muted)" }}>{msg}</p>;
}
