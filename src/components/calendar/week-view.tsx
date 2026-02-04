"use client";

import { clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { getWeekDays, ymd } from "@/lib/dates";
import { getStatusForDate, isHabitDueOnDate } from "@/lib/habits";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedDate } from "@/store/slices/habitsSlice";

export function WeekView() {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((s) => s.habits.selectedDate);
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);

  const anchor = parseISO(selectedDate);
  const days = getWeekDays(anchor, 1);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const key = ymd(d);
          const dueHabits = habits.filter((h) => isHabitDueOnDate(h, d));
          let done = 0;
          let missed = 0;
          let skipped = 0;
          for (const h of dueHabits) {
            const status = getStatusForDate(h, entries, d);
            if (status === "done") done += 1;
            if (status === "missed") missed += 1;
            if (status === "skipped") skipped += 1;
          }

          return (
            <button
              key={key}
              onClick={() => dispatch(setSelectedDate(key))}
              className={clsx(
                "rounded-md border border-zinc-200 bg-zinc-50 px-2 py-3 text-left hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60",
                key === selectedDate && "ring-2 ring-zinc-900 dark:ring-zinc-100"
              )}
            >
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{format(d, "EEE")}</div>
              <div className="text-lg font-semibold">{format(d, "d")}</div>
              <div className="mt-2 flex gap-1">
                {done ? <span className="h-2 w-2 rounded-full bg-green-500" /> : null}
                {skipped ? <span className="h-2 w-2 rounded-full bg-amber-500" /> : null}
                {missed ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
