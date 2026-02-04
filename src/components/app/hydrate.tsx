"use client";

import type { HabitCategory, Habit, HabitEntry } from "@/types/habits";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateFromRemote, hydrateFromStorage } from "@/store/slices/habitsSlice";

export function Hydrate() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((s) => s.habits.hydrated);
  const localCounts = useAppSelector((s) => ({
    habits: s.habits.habits.length,
    entries: s.habits.entries.length,
    categories: s.habits.categories.length,
  }));

  useEffect(() => {
    if (hydrated) return;

    dispatch(hydrateFromStorage());

    (async () => {
      try {
        const res = await fetch("/api/sync/pull", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as
          | { categories: HabitCategory[]; habits: Habit[]; entries: HabitEntry[] }
          | null;
        if (!data) return;

        const remoteHasData = (data.habits?.length ?? 0) > 0 || (data.entries?.length ?? 0) > 0;
        const localIsEmpty = localCounts.habits === 0 && localCounts.entries === 0;

        if (remoteHasData || localIsEmpty) {
          dispatch(
            hydrateFromRemote({
              categories: data.categories ?? [],
              habits: data.habits ?? [],
              entries: data.entries ?? [],
            })
          );
        }
      } catch {
        // ignore network errors during hydration
      }
    })();
  }, [dispatch, hydrated, localCounts]);

  return null;
}
