const STORAGE_KEY = "TRKFLY_progress";

interface ProgressStore {
  [roadmapLanguage: string]: {
    [topicId: string]: { completed: boolean; completedAt: string };
  };
}

function getStore(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: ProgressStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Mark a topic as complete.
 * Returns true if this is the FIRST time it's being marked complete (new), false otherwise.
 */
export function markTopicComplete(language: string, topicId: string): boolean {
  const store = getStore();
  if (!store[language]) store[language] = {};
  const wasNew = !store[language][topicId]?.completed;
  store[language][topicId] = {
    completed: true,
    completedAt: new Date().toISOString(),
  };
  saveStore(store);
  return wasNew;
}

export function isTopicComplete(language: string, topicId: string): boolean {
  const store = getStore();
  return store[language]?.[topicId]?.completed ?? false;
}

export function getCompletedTopics(language: string): string[] {
  const store = getStore();
  if (!store[language]) return [];
  return Object.entries(store[language])
    .filter(([, v]) => v.completed)
    .map(([k]) => k);
}

export function getCompletionCount(
  language: string,
  topicIds: string[]
): number {
  const store = getStore();
  if (!store[language]) return 0;
  return topicIds.filter((id) => store[language][id]?.completed).length;
}
