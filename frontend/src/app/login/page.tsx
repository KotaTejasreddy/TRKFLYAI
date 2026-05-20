"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { login as loginApi } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/learn";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: e2 } = await loginApi(email.trim().toLowerCase(), password);
    setLoading(false);
    if (e2 || !data) { setError(e2 || "Login failed."); return; }
    login(data.token, data.user);
    router.push(next);
  }

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4">
              <LockClosedIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">Welcome back</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Sign in to continue your learning streak.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3 p-6 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !email || !password}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow">
              {loading ? "Signing in…" : <>Sign in <ArrowRightIcon className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            New here?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-indigo-300 hover:text-indigo-200 font-semibold">
              Create an account
            </Link>
            {" "}— 3 days free, no card.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
