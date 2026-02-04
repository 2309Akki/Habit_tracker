"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Habit, HabitFrequency } from "@/types/habits";
import { uid } from "@/lib/ids";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addHabit, deleteHabit, updateHabit } from "@/store/slices/habitsSlice";
import { setSelectedCategoryId, setStatusFilter, toggleShowOnlyDue } from "@/store/slices/uiSlice";

const weekDays = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

function defaultHabit(categories: { id: string }[]) {
  const first = categories[0]?.id ?? "health";
  return {
    id: uid("habit"),
    name: "",
    description: "",
    categoryId: first,
    frequency: "daily" as HabitFrequency,
    weeklyDays: [1, 2, 3, 4, 5],
    monthlyDay: 1,
    color: "#3b82f6",
    reminderTime: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies Habit;
}

export function HabitList() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((s) => s.habits.habits);
  const categories = useAppSelector((s) => s.habits.categories);
  const selectedCategoryId = useAppSelector((s) => s.ui.selectedCategoryId);
  const statusFilter = useAppSelector((s) => s.ui.statusFilter);
  const showOnlyDue = useAppSelector((s) => s.ui.showOnlyDue);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Habit>(() => defaultHabit(categories));
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredHabits = useMemo(() => {
    if (!selectedCategoryId) return habits;
    return habits.filter((h) => h.categoryId === selectedCategoryId);
  }, [habits, selectedCategoryId]);

  function resetDraft() {
    setDraft(defaultHabit(categories));
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    resetDraft();
  }

  function startEdit(h: Habit) {
    setAdding(true);
    setEditingId(h.id);
    setDraft({ ...h });
  }

  function save() {
    if (!draft.name.trim()) return;
    if (editingId) {
      dispatch(updateHabit({ id: editingId, patch: draft }));
    } else {
      dispatch(
        addHabit({
          ...draft,
          id: uid("habit"),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    }
    setAdding(false);
    setEditingId(null);
    resetDraft();
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Habits</div>
        <Button size="sm" onClick={startAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Select value={selectedCategoryId ?? ""} onChange={(e) => dispatch(setSelectedCategoryId(e.target.value || null))}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value as "done" | "missed" | "skipped" | "all"))}>
          <option value="all">All status</option>
          <option value="done">Done</option>
          <option value="missed">Missed</option>
          <option value="skipped">Skipped</option>
        </Select>
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showOnlyDue} onChange={() => dispatch(toggleShowOnlyDue())} />
          Only due habits in day panel
        </label>
      </div>

      <div className="mt-3 space-y-2">
        {filteredHabits.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">No habits yet.</div>
        ) : (
          filteredHabits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <button className="flex-1 text-left" onClick={() => startEdit(h)}>
                <div className="text-sm font-medium">{h.name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{h.frequency}</div>
              </button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dispatch(deleteHabit({ id: h.id }))}
                aria-label="Delete habit"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {adding ? (
        <div className="mt-4 space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-sm font-semibold">{editingId ? "Edit Habit" : "New Habit"}</div>
          <Input
            placeholder="Habit name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <Textarea
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={draft.categoryId}
              onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={draft.frequency}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  frequency: e.target.value as HabitFrequency,
                }))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>

          {draft.frequency === "weekly" ? (
            <div className="flex flex-wrap gap-2">
              {weekDays.map((wd) => {
                const active = draft.weeklyDays.includes(wd.id);
                return (
                  <Button
                    key={wd.id}
                    size="sm"
                    variant={active ? "primary" : "secondary"}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        weeklyDays: active
                          ? d.weeklyDays.filter((x) => x !== wd.id)
                          : [...d.weeklyDays, wd.id].sort(),
                      }))
                    }
                    type="button"
                  >
                    {wd.label}
                  </Button>
                );
              })}
            </div>
          ) : null}

          {draft.frequency === "monthly" ? (
            <Input
              type="number"
              min={1}
              max={31}
              value={draft.monthlyDay ?? 1}
              onChange={(e) => setDraft((d) => ({ ...d, monthlyDay: Number(e.target.value) }))}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
            />
            <Input
              type="time"
              value={draft.reminderTime ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, reminderTime: e.target.value ? e.target.value : null }))
              }
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={save}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
