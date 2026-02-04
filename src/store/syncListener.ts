import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addCategory,
  addHabit,
  deleteHabit,
  removeEntry,
  updateEntryNote,
  updateHabit,
  upsertEntry,
} from "@/store/slices/habitsSlice";

type TimeoutHandle = ReturnType<typeof setTimeout>;

export const syncListenerMiddleware = createListenerMiddleware();

let timer: TimeoutHandle | null = null;

let authCached: boolean | null = null;
let authCheckedAt = 0;

async function isAuthenticated() {
  const now = Date.now();
  if (authCached !== null && now - authCheckedAt < 30_000) return authCached;

  authCheckedAt = now;
  const res = await fetch("/api/auth/me", { credentials: "include" }).catch(() => null);
  if (!res || !res.ok) {
    authCached = false;
    return false;
  }

  const data = (await res.json().catch(() => null)) as { user: { email: string } | null } | null;
  authCached = Boolean(data?.user?.email);
  return authCached;
}

async function pushSnapshot(getState: () => unknown) {
  const authed = await isAuthenticated();
  if (!authed) return;

  const state = getState() as { habits: { categories: { id: string; name: string; color: string }[]; habits: { id: string; name: string; categoryId: string }[]; entries: { id: string; habitId: string; date: string; status: string; note: string }[] } | null };
  const habitsState = state.habits;
  if (!habitsState) return;

  const payload = {
    categories: habitsState.categories,
    habits: habitsState.habits,
    entries: habitsState.entries,
  };

  const res = await fetch("/api/sync/replace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }).catch(() => null);

  if (!res) return;
  if (res.status === 401) return;
}

syncListenerMiddleware.startListening({
  matcher: isAnyOf(addHabit, updateHabit, deleteHabit, upsertEntry, removeEntry, updateEntryNote, addCategory),
  effect: async (_action, api) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void pushSnapshot(api.getState);
    }, 750);
  },
});
