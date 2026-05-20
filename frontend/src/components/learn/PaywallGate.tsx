"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LockClosedIcon, SparklesIcon, ArrowRightIcon, FireIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Wraps LearnAI pages. Routes:
 *   - not signed in → /login?next=<current>
 *   - signed in, has trial/sub → render children
 *   - signed in, expired → "Subscribe" upsell card
 */
export default function PaywallGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, access, loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/learn";
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, token, router]);

  // Initial loading
  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-indigo-500/30 rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Checking access…</span>
        </div>
      </div>
    );
  }

  // Not logged in — redirect in progress, show nothing
  if (!token) return null;

  // Logged in but no access (trial/sub expired)
  if (access && !access.has_access) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center">
        <div className="max-w-md w-full mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl text-center"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.08))",
              border: "1px solid rgba(99,102,241,0.30)",
              boxShadow: "0 0 50px rgba(99,102,241,0.15)",
            }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 mb-5">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
              Your access has expired
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              {access.reason || "Pick a plan to continue learning. Starts at ₹49/month."}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5 text-[11px]">
              <div className="p-2 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="font-bold text-lg" style={{ color: "var(--text)" }}>₹49</div>
                <div style={{ color: "var(--text-muted)" }}>1 month</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.40)" }}>
                <div className="font-bold text-lg text-indigo-300">₹99</div>
                <div className="text-indigo-300">3 months ★</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="font-bold text-lg" style={{ color: "var(--text)" }}>₹299</div>
                <div style={{ color: "var(--text-muted)" }}>1 year</div>
              </div>
            </div>
            <Link href="/subscribe"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow">
              See plans <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link href="/" className="block mt-3 text-xs hover:underline" style={{ color: "var(--text-muted)" }}>
              ← Back to home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Has access — show kid + small trial banner if on trial
  return (
    <>
      {access?.plan === "trial" && access.days_left <= 2 && (
        <div className="fixed top-16 left-0 right-0 z-30 px-4 pt-2 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-2.5 rounded-xl flex items-center gap-2.5 pointer-events-auto"
            style={{
              background: "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(99,102,241,0.15))",
              border: "1px solid rgba(245,158,11,0.3)",
              backdropFilter: "blur(12px)",
            }}>
            <FireIcon className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-xs flex-1" style={{ color: "var(--text)" }}>
              <span className="font-bold">{access.days_left}</span> day{access.days_left !== 1 ? "s" : ""} left in free trial · {user?.handle || user?.email}
            </span>
            <Link href="/subscribe"
              className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold whitespace-nowrap flex items-center gap-1">
              Upgrade <SparklesIcon className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
      )}
      {children}
    </>
  );
}
