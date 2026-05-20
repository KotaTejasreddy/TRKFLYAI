"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, CheckIcon, BoltIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPlans, createPaymentOrder, verifyPayment } from "@/lib/api";
import type { PlanInfo } from "@/types";

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

export default function SubscribePage() {
  const router = useRouter();
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
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeftIcon className="w-4 h-4" /> Back to LearnAI
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Pick your plan</span>
          </h1>
          <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Multi-language AI lessons. Mock interviews. Code playground. All 17 roadmaps.
            Cancel anytime — but you won't want to.
          </p>
          {access && (
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
