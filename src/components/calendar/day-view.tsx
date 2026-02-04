"use client";

import { format, parseISO } from "date-fns";
import { useAppSelector } from "@/store/hooks";

export function DayView() {
  const selectedDate = useAppSelector((s) => s.habits.selectedDate);
  const d = parseISO(selectedDate);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold">{format(d, "EEEE, MMM d")}</div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Use the panel below to mark habits.</div>
    </div>
  );
}
