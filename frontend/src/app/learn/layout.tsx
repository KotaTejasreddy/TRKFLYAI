import PaywallGate from "@/components/learn/PaywallGate";
import LearnBrainBackground from "@/components/learn/LearnBrainBackground";

/**
 * Wraps every /learn/* route with:
 *   - cinematic brain background (fixed, pointer-events disabled)
 *   - auth + paywall gate
 *
 * Non-/learn routes (/, /products, /ds, /bi, /dashboard, etc.) remain
 * unaffected by both.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaywallGate>
      <LearnBrainBackground />
      {/* Content sits above the background via z-index in main (already z-10) */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </PaywallGate>
  );
}
