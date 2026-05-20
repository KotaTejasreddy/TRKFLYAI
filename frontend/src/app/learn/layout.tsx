import PaywallGate from "@/components/learn/PaywallGate";

/**
 * Wraps every /learn/* route with the auth + paywall gate.
 * Non-/learn routes (/, /products, /ds, /bi, /dashboard, etc.) remain public.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <PaywallGate>{children}</PaywallGate>;
}
