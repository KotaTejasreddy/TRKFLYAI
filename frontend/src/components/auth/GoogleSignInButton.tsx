"use client";

import { useEffect, useRef, useState } from "react";
import { loginWithGoogle } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

/**
 * Google Sign-In button using Google Identity Services (GIS).
 *
 * Setup:
 *   1. https://console.cloud.google.com/apis/credentials → Create OAuth 2.0 Client ID (Web app)
 *   2. Authorized JavaScript origins: https://trkflyai.com, https://www.trkflyai.com, http://localhost:3000
 *   3. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID env var on Vercel
 *   4. Set GOOGLE_CLIENT_ID env var on Render (same value)
 *
 * If NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set, the button hides itself silently.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

interface Props {
  next?: string;          // where to redirect after success
  postSignup?: boolean;   // if true, redirect to /subscribe?welcome=1 like normal signup
}

export default function GoogleSignInButton({ next = "/learn", postSignup = false }: Props) {
  const router = useRouter();
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return; // no config → hide

    let cancelled = false;

    async function init() {
      // Load Google Identity Services script if not already there
      if (!window.google) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = GSI_SCRIPT;
          s.async = true;
          s.defer = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load Google Sign-In"));
          document.head.appendChild(s);
        });
      }
      if (cancelled || !window.google || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          setError("");
          const { data, error: e } = await loginWithGoogle(response.credential);
          setLoading(false);
          if (e || !data) { setError(e || "Google sign-in failed."); return; }
          login(data.token, data.user);
          router.push(postSignup ? `/subscribe?welcome=1&next=${encodeURIComponent(next)}` : next);
        },
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: postSignup ? "signup_with" : "signin_with",
        shape: "pill",
        logo_alignment: "left",
        width: 320,
      });
    }

    init().catch((e) => setError(String(e)));

    return () => { cancelled = true; };
  }, [clientId, postSignup, next, login, router]);

  if (!clientId) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex justify-center" />
      {loading && (
        <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Signing you in…
        </div>
      )}
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
