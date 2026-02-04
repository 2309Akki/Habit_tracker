"use client";

import { clsx } from "clsx";
import { Check, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ymd } from "@/lib/dates";
import {
  completionForHabitInMonth,
  getEntry,
  isHabitDueOnDate,
} from "@/lib/habits";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeEntry, setSelectedDate, upsertEntry } from "@/store/slices/habitsSlice";

function getDaysInMonth(anchor: Date) {
  const days: Date[] = [];
  for (let day = 1; day <= 31; day++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth(), day);
    if (d.getMonth() !== anchor.getMonth()) break;
    days.push(d);
  }
  return days;
}

export function MonthView() {
  const dispatch = useAppDispatch();
  const monthAnchor = useAppSelector((s) => s.habits.monthAnchor);
  const selectedDate = useAppSelector((s) => s.habits.selectedDate);
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);
  const categories = useAppSelector((s) => s.habits.categories);
  const selectedCategoryId = useAppSelector((s) => s.ui.selectedCategoryId);

  const anchor = parseISO(monthAnchor);
  const days = getDaysInMonth(anchor);

  const visibleHabits = selectedCategoryId
    ? habits.filter((h) => h.categoryId === selectedCategoryId)
    : habits;

  function toggleDone(habitId: string, dateKey: string) {
    const existing = getEntry(entries, habitId, dateKey);
    if (existing?.status === "done") {
      dispatch(removeEntry({ habitId, date: dateKey }));
      return;
    }
    dispatch(upsertEntry({ habitId, date: dateKey, status: "done" }));
  }

  function setSkipped(habitId: string, dateKey: string) {
    const existing = getEntry(entries, habitId, dateKey);
    if (existing?.status === "skipped") {
      dispatch(removeEntry({ habitId, date: dateKey }));
      return;
    }
    dispatch(upsertEntry({ habitId, date: dateKey, status: "skipped" }));
  }

  function setMissed(habitId: string, dateKey: string) {
    const existing = getEntry(entries, habitId, dateKey);
    if (existing?.status === "missed") {
      dispatch(removeEntry({ habitId, date: dateKey }));
      return;
    }
    dispatch(upsertEntry({ habitId, date: dateKey, status: "missed" }));
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="text-sm font-semibold">My Habits</div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Click = done · Shift+click = skip · Alt+click = missed
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-max border-separate border-spacing-0">
          <thead>
            <tr>
              {/* <th className="sticky left-0 z-10 w-52 border-b border-zinc-200 bg-white px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Habit
              </th> */}
              
              <th className="sticky left-0 z-10 sm:w-1/3 w-52 border-b border-zinc-200 bg-white px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
  Habit
</th>


              {days.map((d) => (
                <th
                  key={ymd(d)}
                  className="border-b border-zinc-200 bg-white px-1 py-2 text-center text-[10px] font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                >
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[9px]">{format(d, "EEE")[0]}</span>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-200">
                      {format(d, "d")}
                    </span>
                  </div>
                </th>
              ))}

              <th className="border-b border-zinc-200 bg-white px-3 py-2 text-right text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                %
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleHabits.length === 0 ? (
              <tr>
                <td
                  colSpan={days.length + 2}
                  className="px-4 py-10 text-sm text-zinc-500 dark:text-zinc-400"
                >
                  Add a habit to start tracking.
                </td>
              </tr>
            ) : (
              visibleHabits.map((h) => {
                const cat = categories.find((c) => c.id === h.categoryId);
                const stats = completionForHabitInMonth(h, entries, anchor);

                return (
                  <tr
                    key={h.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    {/* Habit cell */}
                    <td className="sticky left-0 z-10 w-52 border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: h.color }}
                        />
                        <div className="min-w-0 leading-tight">
                          <div className="truncate text-[13px] font-medium">
                            {h.name}
                          </div>
                          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {cat?.name ?? ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {days.map((d) => {
                      const dateKey = ymd(d);
                      const due = isHabitDueOnDate(h, d);
                      const entry = getEntry(entries, h.id, dateKey);
                      const status = entry?.status ?? "none";
                      const isSelected = dateKey === selectedDate;

                      const cellBase =
                        "border-b border-zinc-200 px-1 py-2 text-center align-middle dark:border-zinc-800";

                      if (!due) {
                        return (
                          <td key={dateKey} className={clsx(cellBase, "opacity-30")}>
                            <div className="mx-auto h-4 w-4 rounded-sm border border-transparent" />
                          </td>
                        );
                      }

                      const isDone = status === "done";
                      const isSkipped = status === "skipped";
                      const isMissed = status === "missed";

                      return (
                        <td key={dateKey} className={cellBase}>
                          <button
                            type="button"
                            onClick={(e) => {
                              dispatch(setSelectedDate(dateKey));
                              if (e.altKey) return setMissed(h.id, dateKey);
                              if (e.shiftKey) return setSkipped(h.id, dateKey);
                              return toggleDone(h.id, dateKey);
                            }}
                            className={clsx(
                              "mx-auto flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                              isDone && "border-green-500 bg-green-500 text-white",
                              isSkipped &&
                                "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              isMissed &&
                                "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
                              !isDone &&
                                !isSkipped &&
                                !isMissed &&
                                "border-zinc-300 dark:border-zinc-700",
                              isSelected &&
                                "ring-2 ring-zinc-900 dark:ring-zinc-100"
                            )}
                            aria-label={`${h.name} on ${dateKey}: ${status}`}
                          >
                            {isDone && <Check className="h-3 w-3" />}
                            {isSkipped && <Minus className="h-3 w-3" />}
                          </button>
                        </td>
                      );
                    })}

                    {/* Stats */}
                    <td className="border-b border-zinc-200 px-3 py-2 text-right text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                      {stats.rate}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
