"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { completionForHabitInMonth, getEntry, getStatusForDate, isHabitDueOnDate } from "@/lib/habits";
import { parseYmd, ymd } from "@/lib/dates";
import type { HabitEntry } from "@/types/habits";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateEntryNote, upsertEntry } from "@/store/slices/habitsSlice";

export function DayPanel({ listMode = false }: { listMode?: boolean }) {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((s) => s.habits.selectedDate);
  const monthAnchor = useAppSelector((s) => s.habits.monthAnchor);
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);
  const categories = useAppSelector((s) => s.habits.categories);

  const selectedCategoryId = useAppSelector((s) => s.ui.selectedCategoryId);
  const statusFilter = useAppSelector((s) => s.ui.statusFilter);
  const showOnlyDue = useAppSelector((s) => s.ui.showOnlyDue);

  const d = parseISO(selectedDate);
  const dateKey = ymd(d);

  const rows = useMemo(() => {
    const day = parseYmd(selectedDate);

    return habits
      .filter((h) => (selectedCategoryId ? h.categoryId === selectedCategoryId : true))
      .map((h) => {
        const due = isHabitDueOnDate(h, day);
        const status = getStatusForDate(h, entries, day);
        const cat = categories.find((c) => c.id === h.categoryId);
        const entry = getEntry(entries, h.id, ymd(day));
        const month = parseISO(monthAnchor);
        const monthStats = completionForHabitInMonth(h, entries, month);
        return {
          habit: h,
          due,
          status,
          category: cat,
          entry,
          monthStats,
        };
      })
      .filter((r) => {
        if (showOnlyDue && !listMode) {
          if (!r.due) return false;
        }
        if (statusFilter === "all") return true;
        return r.status === statusFilter;
      });
  }, [categories, entries, habits, listMode, monthAnchor, selectedCategoryId, selectedDate, showOnlyDue, statusFilter]);

  function setStatus(habitId: string, status: HabitEntry["status"]) {
    dispatch(upsertEntry({ habitId, date: dateKey, status }));
    if (status === "done") toast.success("Marked done");
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{listMode ? "All Habits" : "Today"}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {listMode ? "Quick status updates" : format(d, "EEEE, MMM d")}
          </div>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{rows.length} shown</div>
      </div>

      <div className="mt-3 space-y-3">
        {rows.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">No habits match your filters.</div>
        ) : (
          rows.map((r) => {
            const note = r.entry?.note ?? "";
            return (
              <div
                key={r.habit.id}
                className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: r.habit.color }}
                      />
                      <div className="truncate text-sm font-medium">{r.habit.name}</div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{r.category?.name ?? ""}</span>
                      <span>·</span>
                      <span>{r.habit.frequency}</span>
                      <span>·</span>
                      <span>{r.monthStats.done}/{r.monthStats.due} ({r.monthStats.rate}%)</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant={r.status === "done" ? "primary" : "secondary"}
                      onClick={() => setStatus(r.habit.id, "done")}
                      disabled={!r.due && !listMode}
                      type="button"
                    >
                      Done
                    </Button>
                    <Button
                      size="sm"
                      variant={r.status === "skipped" ? "primary" : "secondary"}
                      onClick={() => setStatus(r.habit.id, "skipped")}
                      disabled={!r.due && !listMode}
                      type="button"
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      variant={r.status === "missed" ? "danger" : "secondary"}
                      onClick={() => setStatus(r.habit.id, "missed")}
                      disabled={!r.due && !listMode}
                      type="button"
                    >
                      Miss
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <Textarea
                    placeholder="Add a note/reflection for this habit on this day…"
                    value={note}
                    onChange={(e) => dispatch(updateEntryNote({ habitId: r.habit.id, date: dateKey, note: e.target.value }))}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
