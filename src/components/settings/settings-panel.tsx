"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addHabit, hydrateFromRemote } from "@/store/slices/habitsSlice";
import type { HabitTemplate, HabitCategory, Habit, HabitEntry } from "@/types/habits";
import { uid } from "@/lib/ids";

const templates: HabitTemplate[] = [
  {
    id: "fitness_pack",
    name: "Fitness Pack",
    habits: [
      {
        name: "Workout",
        description: "Strength or cardio",
        frequency: "weekly",
        weeklyDays: [1, 3, 5],
        monthlyDay: 1,
        categoryName: "Exercise",
        color: "#f97316",
      },
      {
        name: "Steps 8k",
        description: "Walk daily",
        frequency: "daily",
        weeklyDays: [],
        monthlyDay: 1,
        categoryName: "Health",
        color: "#22c55e",
      },
    ],
  },
  {
    id: "study_flow",
    name: "Study Flow",
    habits: [
      {
        name: "Deep Study",
        description: "60 minutes focused",
        frequency: "daily",
        weeklyDays: [],
        monthlyDay: 1,
        categoryName: "Study",
        color: "#3b82f6",
      },
      {
        name: "Revision",
        description: "Review notes",
        frequency: "weekly",
        weeklyDays: [6],
        monthlyDay: 1,
        categoryName: "Study",
        color: "#6366f1",
      },
    ],
  },
  {
    id: "wellness_daily",
    name: "Wellness Daily",
    habits: [
      {
        name: "Meditation",
        description: "10 minutes",
        frequency: "daily",
        weeklyDays: [],
        monthlyDay: 1,
        categoryName: "Mind",
        color: "#a855f7",
      },
      {
        name: "Journal",
        description: "1 short reflection",
        frequency: "daily",
        weeklyDays: [],
        monthlyDay: 1,
        categoryName: "Mind",
        color: "#ec4899",
      },
    ],
  },
];

export function SettingsPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.habits.categories);
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);
  const [meEmail, setMeEmail] = useState<string | null>(null);

  const categoriesByName = useMemo(
    () =>
      new Map(
        categories.map((c) => [c.name.toLowerCase(), c.id] as [string, string])
      ),
    [categories]
  );
  }, [categories]);

  async function refreshMe() {
    const res = await fetch("/api/auth/me", { credentials: "include" }).catch(() => null);
    if (!res) return;
    const data = (await res.json().catch(() => null)) as { user: { email: string } | null } | null;
    setMeEmail(data?.user?.email ?? null);
  }

  async function pullSnapshot() {
    const res = await fetch("/api/sync/pull", { credentials: "include" }).catch(() => null);
    if (!res) throw new Error("Network error");
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error("Failed to pull");
    const data = (await res.json().catch(() => null)) as
      | { categories: HabitCategory[]; habits: Habit[]; entries: HabitEntry[] }
      | null;
    if (!data) throw new Error("Invalid response");
    return data;
  }

  async function pushLocalSnapshot() {
    const payload = {
      categories,
      habits,
      entries,
    };

    const res = await fetch("/api/sync/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    }).catch(() => null);

    if (!res) throw new Error("Network error");
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error("Failed to push");
  }

  async function syncAfterAuth() {
    const remote1 = await pullSnapshot();
    const remoteEmpty = (remote1.habits?.length ?? 0) === 0 && (remote1.entries?.length ?? 0) === 0;
    const localHasData = habits.length > 0 || entries.length > 0;

    if (remoteEmpty && localHasData) {
      await pushLocalSnapshot();
    }

    const remote2 = await pullSnapshot();
    dispatch(
      hydrateFromRemote({
        categories: remote2.categories ?? [],
        habits: remote2.habits ?? [],
        entries: remote2.entries ?? [],
      })
    );
  }

  useEffect(() => {
    void refreshMe();
  }, []);

  async function doRegister() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Registration failed");

      await refreshMe();
      await syncAfterAuth();
      toast.success("Account created and synced");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Login failed");

      await refreshMe();
      await syncAfterAuth();
      toast.success("Logged in and synced");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function doLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      await refreshMe();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    } finally {
      setBusy(false);
    }
  }

  async function doPull() {
    setBusy(true);
    try {
      const remote = await pullSnapshot();
      dispatch(
        hydrateFromRemote({
          categories: remote.categories ?? [],
          habits: remote.habits ?? [],
          entries: remote.entries ?? [],
        })
      );
      toast.success("Pulled from server");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pull failed");
    } finally {
      setBusy(false);
    }
  }

  async function doPush() {
    setBusy(true);
    try {
      await pushLocalSnapshot();
      toast.success("Pushed local data to server");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Push failed");
    } finally {
      setBusy(false);
    }
  }

  function applyTemplate(templateId: string) {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;

    for (const h of t.habits) {
      const categoryId = categoriesByName.get(h.categoryName.toLowerCase()) ?? categories[0]?.id ?? "health";
      dispatch(
        addHabit({
          id: uid("habit"),
          name: h.name,
          description: h.description,
          categoryId,
          frequency: h.frequency,
          weeklyDays: h.weeklyDays,
          monthlyDay: h.frequency === "monthly" ? h.monthlyDay : null,
          color: h.color ?? "#3b82f6",
          reminderTime: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    }

    toast.success(`Applied template: ${t.name}`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Account & Sync</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {meEmail ? `Signed in as ${meEmail}` : "Not signed in"}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsRegistering(!isRegistering)} 
            disabled={busy}
          >
            {isRegistering ? "Login" : "Register"}
          </Button>
          <Button size="sm" variant="primary" onClick={isRegistering ? doRegister : doLogin} disabled={busy}>
            {isRegistering ? "Register" : "Login"}
          </Button>
          {meEmail && (
            <Button size="sm" variant="ghost" onClick={doLogout} disabled={busy}>
              Logout
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={doPull} disabled={busy}>
            Pull
          </Button>
          <Button size="sm" variant="secondary" onClick={doPush} disabled={busy}>
            Push
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Templates</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Add a starter set of habits.</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {templates.map((t) => (
            <Button key={t.id} size="sm" variant="secondary" onClick={() => applyTemplate(t.id)}>
              {t.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Reminders (basic)</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Reminder times are stored per habit. Browser notifications require user permission and a PWA setup.
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Integrations</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Notion/calendar integration will be added as export/import adapters.
        </div>
      </div>
    </div>
  );
}
