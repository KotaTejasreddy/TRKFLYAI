"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, BoltIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPlans, createPaymentOrder, verifyPayment } from "@/lib/api";
import type { PlanInfo } from "@/types";

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-16 min-h-screen" />}>
      <SubscribePageInner />
    </Suspense>
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(s);
  });
}

function SubscribePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";
  const skipTo = searchParams.get("next") || "/learn";
  const { token, user, access, loading: authLoading, refresh } = useAuth();
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [trialDays, setTrialDays] = useState(3);
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await getPlans();
      if (data) {
        setPlans(data.plans);
        setTrialDays(data.trial_days);
      }
    })();
  }, []);

  // Redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !token) router.push("/login?next=/subscribe");
  }, [authLoading, token, router]);

  async function buy(plan: PlanInfo) {
    if (!token) return;
    setError("");
    setBuyingPlan(plan.id);

    const { data: order, error: e1 } = await createPaymentOrder(token, plan.id);
    if (e1 || !order) {
      setError(e1 || "Could not create order");
      setBuyingPlan(null);
      return;
    }

    // Mock mode — skip checkout, go straight to verify
    if (order.mock) {
      const { data: vData, error: e2 } = await verifyPayment(token, {
        razorpay_order_id: order.order_id,
        razorpay_payment_id: "pay_mock_" + Date.now(),
        razorpay_signature: "mock_signature",
        plan: plan.id,
      });
      setBuyingPlan(null);
      if (e2 || !vData) { setError(e2 || "Verification failed"); return; }
      await refresh();
      router.push("/learn");
      return;
    }

    // Real Razorpay flow
    try {
      await loadRazorpay();
    } catch {
      setError("Couldn't load payment SDK. Check your internet.");
      setBuyingPlan(null);
      return;
    }

    const checkout = new window.Razorpay!({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "TRKFLY AI",
      description: `${plan.label} subscription · ${plan.days} days`,
      order_id: order.order_id,
      prefill: { email: user?.email || "", name: user?.handle || "" },
      theme: { color: "#6366f1" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const { data: vData, error: e2 } = await verifyPayment(token, {
          ...response,
          plan: plan.id,
        });
        setBuyingPlan(null);
        if (e2 || !vData) { setError(e2 || "Payment verification failed"); return; }
        await refresh();
        router.push("/learn");
      },
      modal: { ondismiss: () => setBuyingPlan(null) },
    });
    checkout.open();
  }

  if (authLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isWelcome && (
          <Link href="/learn" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeftIcon className="w-4 h-4" /> Back to LearnAI
          </Link>
        )}

        {/* Welcome banner for first-time signups */}
        {isWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(99,102,241,0.10))",
              border: "1px solid rgba(16,185,129,0.30)",
            }}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-300 mb-0.5">
                Welcome to TRKFLY AI{user?.handle ? `, ${user.handle}` : ""} 🎉
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Your <span className="text-emerald-300">{trialDays}-day free trial</span> is active. Pick a plan now to lock in your price and extend access.
              </div>
            </div>
            <Link
              href={skipTo}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Skip · use trial
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">{isWelcome ? "Choose your plan" : "Pick your plan"}</span>
          </h1>
          <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Multi-language AI lessons. Mock interviews. Code playground. All 17 roadmaps.
            Cancel anytime — but you won't want to.
          </p>
          {access && !isWelcome && (
            <div className="mt-4 inline-block px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Current: <span className="text-indigo-300">{access.plan}</span> · {access.days_left} days left
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl flex flex-col ${p.popular ? "border-2 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.20)]" : ""}`}
              style={{
                background: p.popular ? "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))" : "var(--bg-card)",
                border: p.popular ? undefined : "1px solid var(--border)",
              }}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--text-muted)" }}>
                {p.label}
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold gradient-text">₹{p.amount}</span>
                <span className="text-sm mb-1.5" style={{ color: "var(--text-muted)" }}>/ {p.days}d</span>
              </div>
              <div className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                ₹{(p.amount / p.days).toFixed(2)} per day
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {[
                  "All 17 roadmaps + multi-language",
                  "AI lessons · quizzes · cheat sheets",
                  "Code playground (Python/JS/Java/C++/Go)",
                  "Mock interviews with AI feedback",
                  "XP, streaks, leaderboard",
                  "Cancel anytime",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs" style={{ color: "var(--text)" }}>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buy(p)}
                disabled={!!buyingPlan}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-wait ${
                  p.popular
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : ""
                }`}
                style={!p.popular ? { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" } : undefined}
              >
                {buyingPlan === p.id ? "Opening checkout…" : "Get " + p.label}
              </button>
            </motion.div>
          ))}
        </div>

        {isWelcome && (
          <div className="text-center mb-6">
            <Link
              href={skipTo}
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Not now — continue with my {trialDays}-day free trial
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          <div className="inline-flex items-center gap-2">
            <BoltIcon className="w-3.5 h-3.5" />
            Secure payments by Razorpay · UPI · Cards · Net Banking
          </div>
          <div className="mt-2">
            New accounts get a free {trialDays}-day trial automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
