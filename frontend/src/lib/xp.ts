/**
 * XP / streak / level system.
 * State lives in localStorage + a tiny pubsub so any component can subscribe.
 *
 *   Levels: floor(xp / 100) — every 100 XP = 1 level
 *   Awards: completeTopic = +20 xp, perfectQuiz = +10 xp bonus
 *   Streak: consecutive days the user did at least one action
 */

const KEY = "trk_xp_state";
const XP_PER_TOPIC = 20;
const XP_PER_QUIZ = 10;

export interface XpState {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: { date: string; xp: number; reason: string }[];
}

type Listener = (s: XpState) => void;
const listeners = new Set<Listener>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): XpState {
  if (typeof window === "undefined") {
    return { xp: 0, streakDays: 0, lastActiveDate: "", history: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { xp: 0, streakDays: 0, lastActiveDate: "", history: [] };
    return JSON.parse(raw);
  } catch {
    return { xp: 0, streakDays: 0, lastActiveDate: "", history: [] };
  }
}

function write(s: XpState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l(s));
}

export function getXpState(): XpState {
  return read();
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100);
}

export function getXpToNextLevel(xp: number): { current: number; needed: number } {
  const lvl = getLevel(xp);
  const base = lvl * 100;
  return { current: xp - base, needed: 100 };
}

function bumpStreak(s: XpState) {
  const today = todayKey();
  if (s.lastActiveDate === today) return;
  if (!s.lastActiveDate) {
    s.streakDays = 1;
  } else {
    const last = new Date(s.lastActiveDate);
    const diff = Math.round((Date.now() - last.getTime()) / 86400000);
    s.streakDays = diff === 1 ? s.streakDays + 1 : 1;
  }
  s.lastActiveDate = today;
}

interface AwardResult {
  state: XpState;
  leveledUp: boolean;
  awarded: number;
}

export function awardXp(amount: number, reason: string): AwardResult {
  const before = read();
  const beforeLevel = getLevel(before.xp);
  before.xp += amount;
  before.history.unshift({ date: todayKey(), xp: amount, reason });
  before.history = before.history.slice(0, 50); // cap
  bumpStreak(before);
  write(before);
  return {
    state: before,
    leveledUp: getLevel(before.xp) > beforeLevel,
    awarded: amount,
  };
}

export function awardTopicComplete(): AwardResult {
  return awardXp(XP_PER_TOPIC, "Completed a topic");
}

export function awardQuizBonus(): AwardResult {
  return awardXp(XP_PER_QUIZ, "Perfect quiz");
}

export function subscribeXp(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Hook entrypoint — re-export with React in the consumer */
export const XP_PER_TOPIC_AMOUNT = XP_PER_TOPIC;
export const XP_PER_QUIZ_AMOUNT = XP_PER_QUIZ;
