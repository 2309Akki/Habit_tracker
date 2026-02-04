import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Habit, HabitCategory, HabitEntry, UserRewards } from "@/types/habits";
import { loadDb, saveDb } from "@/lib/storage";
import { uid } from "@/lib/ids";

export type HabitsState = {
  hydrated: boolean;
  habits: Habit[];
  categories: HabitCategory[];
  entries: HabitEntry[];
  rewards: UserRewards;
  selectedDate: string;
  monthAnchor: string;
};

const todayKey = new Date().toISOString().slice(0, 10);
const monthKey = new Date().toISOString().slice(0, 7) + "-01";

const initialState: HabitsState = {
  hydrated: false,
  habits: [],
  categories: [],
  entries: [],
  rewards: { xp: 0, badges: [] },
  selectedDate: todayKey,
  monthAnchor: monthKey,
};

function persist(state: HabitsState) {
  saveDb({
    version: 1,
    habits: state.habits,
    categories: state.categories,
    entries: state.entries,
    rewards: state.rewards,
  });
}

const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const db = loadDb();
      state.hydrated = true;
      state.habits = db.habits;
      state.categories = db.categories;
      state.entries = db.entries;
      state.rewards = db.rewards;
    },
    hydrateFromRemote(
      state,
      action: PayloadAction<{ habits: Habit[]; categories: HabitCategory[]; entries: HabitEntry[] }>
    ) {
      state.hydrated = true;
      state.habits = action.payload.habits;
      state.categories = action.payload.categories;
      state.entries = action.payload.entries;
      persist(state);
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setMonthAnchor(state, action: PayloadAction<string>) {
      state.monthAnchor = action.payload;
    },
    addHabit(
      state,
      action: PayloadAction<
        Omit<Habit, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string }
      >
    ) {
      const now = new Date().toISOString();
      const habit: Habit = {
        ...action.payload,
        id: action.payload.id ?? uid("habit"),
        createdAt: action.payload.createdAt ?? now,
        updatedAt: action.payload.updatedAt ?? now,
      };
      state.habits.push(habit);
      persist(state);
    },
    updateHabit(state, action: PayloadAction<{ id: string; patch: Partial<Habit> }>) {
      const now = new Date().toISOString();
      const idx = state.habits.findIndex((h) => h.id === action.payload.id);
      if (idx === -1) return;
      state.habits[idx] = { ...state.habits[idx], ...action.payload.patch, updatedAt: now };
      persist(state);
    },
    deleteHabit(state, action: PayloadAction<{ id: string }>) {
      state.habits = state.habits.filter((h) => h.id !== action.payload.id);
      state.entries = state.entries.filter((e) => e.habitId !== action.payload.id);
      persist(state);
    },
    upsertEntry(
      state,
      action: PayloadAction<{ habitId: string; date: string; status: HabitEntry["status"]; note?: string }>
    ) {
      const now = new Date().toISOString();
      const idx = state.entries.findIndex(
        (e) => e.habitId === action.payload.habitId && e.date === action.payload.date
      );
      if (idx === -1) {
        state.entries.push({
          id: uid("entry"),
          habitId: action.payload.habitId,
          date: action.payload.date,
          status: action.payload.status,
          note: action.payload.note ?? "",
          updatedAt: now,
        });
      } else {
        state.entries[idx] = {
          ...state.entries[idx],
          status: action.payload.status,
          note: action.payload.note ?? state.entries[idx].note,
          updatedAt: now,
        };
      }
      if (action.payload.status === "done") state.rewards.xp += 10;
      persist(state);
    },
    removeEntry(state, action: PayloadAction<{ habitId: string; date: string }>) {
      state.entries = state.entries.filter(
        (e) => !(e.habitId === action.payload.habitId && e.date === action.payload.date)
      );
      persist(state);
    },
    updateEntryNote(state, action: PayloadAction<{ habitId: string; date: string; note: string }>) {
      const now = new Date().toISOString();
      const idx = state.entries.findIndex(
        (e) => e.habitId === action.payload.habitId && e.date === action.payload.date
      );
      if (idx === -1) {
        state.entries.push({
          id: uid("entry"),
          habitId: action.payload.habitId,
          date: action.payload.date,
          status: "missed",
          note: action.payload.note,
          updatedAt: now,
        });
      } else {
        state.entries[idx] = { ...state.entries[idx], note: action.payload.note, updatedAt: now };
      }
      persist(state);
    },
    addCategory(state, action: PayloadAction<{ name: string; color: string }>) {
      const id = uid("cat");
      state.categories.push({ id, name: action.payload.name, color: action.payload.color });
      persist(state);
    },
  },
});

export const {
  hydrateFromStorage,
  hydrateFromRemote,
  setSelectedDate,
  setMonthAnchor,
  addHabit,
  updateHabit,
  deleteHabit,
  upsertEntry,
  removeEntry,
  updateEntryNote,
  addCategory,
} = habitsSlice.actions;

export default habitsSlice.reducer;
