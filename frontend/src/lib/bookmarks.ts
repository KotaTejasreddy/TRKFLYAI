/**
 * Bookmarks: pin a topic for later. Persisted in localStorage with a tiny pubsub.
 */

const KEY = "trk_bookmarks";

export interface Bookmark {
  roadmap: string;          // slug e.g. "dsa"
  roadmapTitle: string;     // e.g. "Data Structures & Algorithms"
  sectionId: string;
  sectionTitle: string;
  topicId: string;
  topicTitle: string;
  topicDescription?: string;
  pinnedAt: string;         // ISO
}

type Listener = (xs: Bookmark[]) => void;
const listeners = new Set<Listener>();

function read(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write(xs: Bookmark[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(xs));
  listeners.forEach((l) => l(xs));
}

export function listBookmarks(): Bookmark[] { return read(); }

export function isBookmarked(roadmap: string, topicId: string): boolean {
  return read().some((b) => b.roadmap === roadmap && b.topicId === topicId);
}

export function toggleBookmark(b: Omit<Bookmark, "pinnedAt">): boolean {
  const all = read();
  const idx = all.findIndex((x) => x.roadmap === b.roadmap && x.topicId === b.topicId);
  if (idx >= 0) {
    all.splice(idx, 1);
    write(all);
    return false;
  }
  all.unshift({ ...b, pinnedAt: new Date().toISOString() });
  write(all);
  return true;
}

export function removeBookmark(roadmap: string, topicId: string) {
  const all = read().filter((x) => !(x.roadmap === roadmap && x.topicId === topicId));
  write(all);
}

export function subscribeBookmarks(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
