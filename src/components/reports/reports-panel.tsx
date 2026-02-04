"use client";

import Papa from "papaparse";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportDbJson, importDbJson, loadDb, saveDb } from "@/lib/storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateFromStorage } from "@/store/slices/habitsSlice";

export function ReportsPanel() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((s) => s.habits.habits);
  const entries = useAppSelector((s) => s.habits.entries);

  function download(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = entries.map((e) => ({
      date: e.date,
      habitId: e.habitId,
      habitName: habits.find((h) => h.id === e.habitId)?.name ?? "",
      status: e.status,
      note: e.note,
      updatedAt: e.updatedAt,
    }));

    const csv = Papa.unparse(rows);
    download(`habit-entries-${new Date().toISOString().slice(0, 10)}.csv`, new Blob([csv], { type: "text/csv" }));
    toast.success("Exported CSV");
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Habit Tracker Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Habits: ${habits.length}`, 14, 26);
    doc.text(`Entries: ${entries.length}`, 14, 32);

    let y = 42;
    for (const h of habits.slice(0, 20)) {
      doc.text(`• ${h.name} (${h.frequency})`, 14, y);
      y += 6;
      if (y > 280) break;
    }

    download(`habit-report-${new Date().toISOString().slice(0, 10)}.pdf`, doc.output("blob"));
    toast.success("Exported PDF");
  }

  function exportJson() {
    const db = loadDb();
    const json = exportDbJson(db);
    download(`habit-tracker-${new Date().toISOString().slice(0, 10)}.json`, new Blob([json], { type: "application/json" }));
    toast.success("Exported JSON");
  }

  async function importJsonFile(file: File) {
    try {
      const text = await file.text();
      const nextDb = importDbJson(text);
      saveDb(nextDb);
      dispatch(hydrateFromStorage());
      toast.success("Imported data");
    } catch {
      toast.error("Import failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Reports</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Export your data (CSV/PDF/JSON). Import JSON to restore/sync.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" variant="secondary" onClick={exportPdf}>Export PDF</Button>
          <Button size="sm" variant="ghost" onClick={exportJson}>Export JSON</Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJsonFile(f);
                e.currentTarget.value = "";
              }}
            />
            Import JSON
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="font-semibold">Coming next</div>
        <div className="mt-2 text-zinc-500 dark:text-zinc-400">
          Weekly/monthly narrative reports, printable calendar summaries, and Notion export/import.
        </div>
      </div>
    </div>
  );
}
