/**
 * Activity tracker — records the most recent topic the user touched.
 * Used by Smart Resume to show "Continue where you left off".
 */

const KEY = "trk_last_activity";

export interface Activity {
  roadmap: string;          // slug
  roadmapTitle: string;
  sectionId: string;
  sectionTitle: string;
  topicId: string;
  topicTitle: string;
  responseLang: string;
  at: string;               // ISO
}

export function recordActivity(a: Omit<Activity, "at">) {
  if (typeof window === "undefined") return;
  const full: Activity = { ...a, at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(full));
}

export function getLastActivity(): Activity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Friendly "5 min ago" string */
export function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
