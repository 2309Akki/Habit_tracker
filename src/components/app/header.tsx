"use client";

import { addMonths, format, parseISO, subMonths } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { exportDbJson, loadDb } from "@/lib/storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AppView } from "@/types/habits";
import { setMonthAnchor, setSelectedDate } from "@/store/slices/habitsSlice";
import { setView } from "@/store/slices/uiSlice";

export function Header() {
  const dispatch = useAppDispatch();
  const view = useAppSelector((s) => s.ui.view);
  const monthAnchor = useAppSelector((s) => s.habits.monthAnchor);
  const selectedDate = useAppSelector((s) => s.habits.selectedDate);

  const month = parseISO(monthAnchor);

  function onPrevMonth() {
    const next = subMonths(month, 1);
    dispatch(setMonthAnchor(next.toISOString().slice(0, 10)));
  }

  function onNextMonth() {
    const next = addMonths(month, 1);
    dispatch(setMonthAnchor(next.toISOString().slice(0, 10)));
  }

  function onToday() {
    const today = new Date().toISOString().slice(0, 10);
    dispatch(setSelectedDate(today));
    dispatch(setMonthAnchor(today.slice(0, 7) + "-01"));
  }

  function downloadJson() {
    try {
      const db = loadDb();
      const content = exportDbJson(db);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habit-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported JSON");
    } catch {
      toast.error("Export failed");
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold">Habit Tracker</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Selected: {selectedDate}</div>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <Button variant="ghost" size="sm" onClick={downloadJson} aria-label="Export">
              <Download className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onPrevMonth}>
            Prev
          </Button>
          <div className="min-w-36 text-center text-sm font-medium">
            {format(month, "MMMM yyyy")}
          </div>
          <Button variant="secondary" size="sm" onClick={onNextMonth}>
            Next
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            Today
          </Button>

          <div className="w-32">
            <Select value={view} onChange={(e) => dispatch(setView(e.target.value as AppView))}>
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="list">List</option>
            </Select>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" onClick={downloadJson}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <ThemeToggle showLabel={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
