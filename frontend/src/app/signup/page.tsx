"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { signup as signupApi } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/learn";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: e2 } = await signupApi(email.trim().toLowerCase(), password, handle.trim() || undefined);
    setLoading(false);
    if (e2 || !data) { setError(e2 || "Could not create account."); return; }
    login(data.token, data.user);
    // First-time signup → show the subscription options before LearnAI.
    // The 3-day free trial is already active; user can skip + continue with trial.
    router.push(`/subscribe?welcome=1&next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">Start learning free</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              3 days free trial. No credit card needed.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3 p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>Username (optional)</label>
              <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={40} placeholder="tejas"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>Password (min 6)</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !email || !password}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-shadow">
              {loading ? "Creating…" : <>Create account · Start 3-day trial <ArrowRightIcon className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-emerald-300 hover:text-emerald-200 font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
