export type HabitFrequency = "daily" | "weekly" | "monthly";

export type HabitStatus = "done" | "missed" | "skipped" | "none";

export type AppView = "month" | "week" | "day" | "list" | "board" | "timeline";

export type HabitCategory = {
  id: string;
  name: string;
  color: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  frequency: HabitFrequency;
  weeklyDays: number[];
  monthlyDay: number | null;
  color: string;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  date: string;
  status: Exclude<HabitStatus, "none">;
  note: string;
  updatedAt: string;
};

export type HabitTemplate = {
  id: string;
  name: string;
  habits: Array<
    Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "categoryId" | "color" | "reminderTime"
    > & {
      categoryName: string;
      color?: string;
    }
  >;
};

export type BadgeId =
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "perfect_week"
  | "perfect_month";

export type UserRewards = {
  xp: number;
  badges: BadgeId[];
};

export type MonthlySummary = {
  month: string;
  completionRate: number;
  bestDay: string | null;
  worstDay: string | null;
  totalDone: number;
  totalMissed: number;
  totalSkipped: number;
};
