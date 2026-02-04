"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { computeMonthlySummary, computeStreak, completionForHabitInMonth, isHabitDueOnDate } from "@/lib/habits";
import { ymd } from "@/lib/dates";
import { useAppSelector } from "@/store/hooks";

export function AnalyticsPanel() {
  const monthAnchor = useAppSelector((s) => s.habits.monthAnchor);
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);

  const month = parseISO(monthAnchor);

  const summary = useMemo(() => computeMonthlySummary(habits, entries, month), [entries, habits, month]);

  const habitRanks = useMemo(() => {
    return habits
      .map((h) => {
        const monthStats = completionForHabitInMonth(h, entries, month);
        const streaks = computeStreak(h, entries, new Date());
        return {
          id: h.id,
          name: h.name,
          rate: monthStats.rate,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [entries, habits, month]);

  const dailySeries = useMemo(() => {
    const out: Array<{ day: string; rate: number }> = [];

    for (let day = 1; day <= 31; day++) {
      const d = new Date(month.getFullYear(), month.getMonth(), day);
      if (d.getMonth() !== month.getMonth()) break;

      let due = 0;
      let done = 0;
      for (const h of habits) {
        if (!isHabitDueOnDate(h, d)) continue;
        due += 1;
        const key = ymd(d);
        const entry = entries.find((e) => e.habitId === h.id && e.date === key);
        if (entry?.status === "done") done += 1;
      }

      out.push({
        day: format(d, "d"),
        rate: due === 0 ? 0 : Math.round((done / due) * 100),
      });
    }

    return out;
  }, [entries, habits, month]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Summary ({format(month, "MMMM yyyy")})</div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Monthly score</div>
            <div className="text-xl font-semibold">{summary.completionRate}%</div>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Best day</div>
            <div className="text-sm font-medium">{summary.bestDay ?? "—"}</div>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Worst day</div>
            <div className="text-sm font-medium">{summary.worstDay ?? "—"}</div>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Done vs missed</div>
            <div className="text-sm font-medium">
              {summary.totalDone} / {summary.totalMissed}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Monthly trend</div>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySeries} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Habit rank</div>
        <div className="mt-3 space-y-2">
          {habitRanks.length === 0 ? (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Add habits to see rankings.</div>
          ) : (
            habitRanks.map((h, idx) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <div className="min-w-0 truncate">
                  {idx + 1}. {h.name}
                </div>
                <div className="flex shrink-0 gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{h.rate}%</span>
                  <span>streak {h.currentStreak}</span>
                  <span>best {h.longestStreak}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
