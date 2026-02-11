import { z } from "zod";
import type { Habit, HabitCategory, HabitEntry, UserRewards } from "@/types/habits";

const HabitSchema: z.ZodType<Habit> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  frequency: z.union([z.literal("daily"), z.literal("weekly"), z.literal("monthly")]),
  weeklyDays: z.array(z.number().int().min(0).max(6)),
  monthlyDay: z.number().int().min(1).max(31).nullable(),
  color: z.string(),
  reminderTime: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CategorySchema: z.ZodType<HabitCategory> = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

const EntrySchema: z.ZodType<HabitEntry> = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  status: z.union([z.literal("done"), z.literal("missed"), z.literal("skipped")]),
  note: z.string(),
  updatedAt: z.string(),
});

const RewardsSchema: z.ZodType<UserRewards> = z.object({
  xp: z.number().int().nonnegative(),
  badges: z.array(
    z.union([
      z.literal("streak_7"),
      z.literal("streak_30"),
      z.literal("streak_100"),
      z.literal("perfect_week"),
      z.literal("perfect_month"),
    ])
  ),
});

const DBv1Schema = z.object({
  version: z.literal(1),
  habits: z.array(HabitSchema),
  categories: z.array(CategorySchema),
  entries: z.array(EntrySchema),
  rewards: RewardsSchema,
});

export type AppDB = z.infer<typeof DBv1Schema>;

const STORAGE_KEY = "habit_tracker_db";

const defaultDb: AppDB = {
  version: 1,
  habits: [],
  categories: [
    { id: "health", name: "Health", color: "#22c55e" },
    { id: "study", name: "Study", color: "#3b82f6" },
    { id: "exercise", name: "Exercise", color: "#f97316" },
    { id: "mind", name: "Mind", color: "#a855f7" },
  ],
  entries: [],
  rewards: { xp: 0, badges: [] },
};

export function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadDb(): AppDB {
  if (!canUseStorage()) return defaultDb;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultDb;

  try {
    const parsed = JSON.parse(raw);
    const validated = DBv1Schema.safeParse(parsed);
    if (!validated.success) return defaultDb;
    return validated.data;
  } catch {
    return defaultDb;
  }
}

export function saveDb(data: any) {
  try {
    const serialized = JSON.stringify(data);
    
    // Check if data fits in localStorage (rough estimate)
    const sizeInBytes = new Blob([serialized]).size;
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
    
    if (sizeInBytes > maxSizeInBytes) {
      console.warn('Data too large for localStorage, clearing old data...');
      // Clear old data if quota exceeded
      localStorage.removeItem('habit_tracker_db');
    }
    
    localStorage.setItem('habit_tracker_db', serialized);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded, clearing old data...');
      localStorage.removeItem('habit_tracker_db');
      // Try again with essential data only
      const essentialData = {
        categories: data.categories?.slice(0, 10), // Limit categories
        habits: data.habits?.slice(0, 20), // Limit habits  
        entries: data.entries?.slice(0, 50) // Limit entries
      };
      localStorage.setItem('habit_tracker_db', JSON.stringify(essentialData));
    } else {
      console.error('Error saving to localStorage:', error);
    }
  }
}

export function exportDbJson(db: AppDB) {
  return JSON.stringify(db, null, 2);
}

export function importDbJson(json: string): AppDB {
  const parsed = JSON.parse(json);
  const validated = DBv1Schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Invalid import format");
  }
  return validated.data;
}
