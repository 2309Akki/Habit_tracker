import { isSameDay, subDays } from "date-fns";
import type { Habit, HabitEntry, HabitStatus, MonthlySummary } from "@/types/habits";
import { parseYmd, ymd } from "@/lib/dates";

export function isHabitDueOnDate(habit: Habit, date: Date) {
  if (habit.frequency === "daily") return true;

  if (habit.frequency === "weekly") {
    return habit.weeklyDays.includes(date.getDay());
  }

  if (habit.frequency === "monthly") {
    if (!habit.monthlyDay) return false;
    return date.getDate() === habit.monthlyDay;
  }

  return false;
}

export function getEntry(entries: HabitEntry[], habitId: string, dateYmd: string) {
  return entries.find((e) => e.habitId === habitId && e.date === dateYmd) ?? null;
}

export function getStatusForDate(
  habit: Habit,
  entries: HabitEntry[],
  date: Date
): HabitStatus {
  const dateKey = ymd(date);
  const due = isHabitDueOnDate(habit, date);
  const entry = getEntry(entries, habit.id, dateKey);
  if (!due) return "none";
  if (!entry) return "missed";
  return entry.status;
}

export function computeStreak(habit: Habit, entries: HabitEntry[], today: Date) {
  let current = 0;
  let longest = 0;
  let cur = 0;

  const byDate = new Map<string, HabitEntry>();
  for (const e of entries) {
    if (e.habitId !== habit.id) continue;
    byDate.set(e.date, e);
  }

  const lookbackDays = 400;

  for (let i = 0; i < lookbackDays; i++) {
    const d = subDays(today, i);
    if (!isHabitDueOnDate(habit, d)) continue;

    const key = ymd(d);
    const entry = byDate.get(key);
    const status = entry?.status ?? "missed";

    if (status === "done") {
      cur += 1;
      if (cur > longest) longest = cur;
    } else if (status === "skipped") {
      continue;
    } else {
      if (i === 0) {
        current = 0;
      }
      if (current === 0) current = cur;
      cur = 0;
    }
  }

  if (current === 0) current = cur;

  return { current, longest };
}

export function computeMonthlySummary(
  habits: Habit[],
  entries: HabitEntry[],
  monthAnchor: Date
): MonthlySummary {
  const month = monthAnchor.toISOString().slice(0, 7);

  let totalDone = 0;
  let totalMissed = 0;
  let totalSkipped = 0;

  const dailyRates = new Map<string, { done: number; due: number }>();

  for (const habit of habits) {
    for (let day = 1; day <= 31; day++) {
      const d = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day);
      if (d.getMonth() !== monthAnchor.getMonth()) break;

      if (!isHabitDueOnDate(habit, d)) continue;

      const key = ymd(d);
      const entry = getEntry(entries, habit.id, key);
      const status = entry?.status ?? "missed";

      const cur = dailyRates.get(key) ?? { done: 0, due: 0 };
      cur.due += 1;
      if (status === "done") {
        totalDone += 1;
        cur.done += 1;
      } else if (status === "skipped") {
        totalSkipped += 1;
      } else {
        totalMissed += 1;
      }
      dailyRates.set(key, cur);
    }
  }

  let bestDay: string | null = null;
  let worstDay: string | null = null;
  let bestRate = -1;
  let worstRate = 2;

  for (const [key, v] of dailyRates.entries()) {
    const rate = v.due === 0 ? 0 : v.done / v.due;
    if (rate > bestRate) {
      bestRate = rate;
      bestDay = key;
    }
    if (rate < worstRate) {
      worstRate = rate;
      worstDay = key;
    }
  }

  const totalTracked = totalDone + totalMissed;
  const completionRate = totalTracked === 0 ? 0 : Math.round((totalDone / totalTracked) * 100);

  return {
    month,
    completionRate,
    bestDay,
    worstDay,
    totalDone,
    totalMissed,
    totalSkipped,
  };
}

export function completionForHabitInMonth(habit: Habit, entries: HabitEntry[], monthAnchor: Date) {
  let done = 0;
  let due = 0;

  for (let day = 1; day <= 31; day++) {
    const d = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day);
    if (d.getMonth() !== monthAnchor.getMonth()) break;
    if (!isHabitDueOnDate(habit, d)) continue;

    due += 1;
    const entry = getEntry(entries, habit.id, ymd(d));
    if (entry?.status === "done") done += 1;
  }

  return { done, due, rate: due === 0 ? 0 : Math.round((done / due) * 100) };
}

export function wasCompletedOnDate(entries: HabitEntry[], habitId: string, date: Date) {
  const key = ymd(date);
  return entries.some((e) => e.habitId === habitId && e.date === key && e.status === "done");
}

export function isSameYmd(a: string, b: string) {
  return isSameDay(parseYmd(a), parseYmd(b));
}
