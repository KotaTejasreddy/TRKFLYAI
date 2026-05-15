"use client";

import { useEffect, useState } from "react";
import { getXpState, subscribeXp, type XpState } from "./xp";

/** React hook bound to the XP store. Re-renders on every change. */
export function useXp(): XpState {
  const [state, setState] = useState<XpState>(() => ({
    xp: 0, streakDays: 0, lastActiveDate: "", history: [],
  }));

  useEffect(() => {
    setState(getXpState());
    return subscribeXp(setState);
  }, []);

  return state;
}
