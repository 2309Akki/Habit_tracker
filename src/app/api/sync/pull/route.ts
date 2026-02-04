import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

function mapHabit(h: {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  frequency: string;
  weeklyDays: string | null;
  monthlyDay: number | null;
  color: string;
  reminderTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  let weeklyDays: number[] = [];
  if (h.weeklyDays) {
    try {
      const parsed = JSON.parse(h.weeklyDays);
      if (Array.isArray(parsed)) weeklyDays = parsed;
    } catch {
      weeklyDays = [];
    }
  }

  return {
    id: h.id,
    name: h.name,
    description: h.description,
    categoryId: h.categoryId,
    frequency: h.frequency as "daily" | "weekly" | "monthly",
    weeklyDays,
    monthlyDay: h.monthlyDay,
    color: h.color,
    reminderTime: h.reminderTime,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  };
}

function mapEntry(e: {
  id: string;
  habitId: string;
  date: string;
  status: string;
  note: string;
  updatedAt: Date;
}) {
  return {
    id: e.id,
    habitId: e.habitId,
    date: e.date,
    status: e.status as "done" | "missed" | "skipped",
    note: e.note,
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [categories, habits, entries] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.habit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.entry.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "asc" }, { updatedAt: "asc" }],
    }),
  ]);

  return NextResponse.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    habits: habits.map(mapHabit),
    entries: entries.map(mapEntry),
  });
}
