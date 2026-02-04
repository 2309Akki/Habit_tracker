import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const HabitFrequencySchema = z.union([z.literal("daily"), z.literal("weekly"), z.literal("monthly")]);

const CreateHabitSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).default(""),
  categoryId: z.string().min(1),
  frequency: HabitFrequencySchema,
  weeklyDays: z.array(z.number().int().min(0).max(6)).default([]),
  monthlyDay: z.number().int().min(1).max(31).nullable().default(null),
  color: z.string().min(1).max(32),
  reminderTime: z.string().nullable().default(null),
});

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

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ habits: habits.map(mapHabit) });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateHabitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: parsed.data.categoryId, userId: user.id },
    select: { id: true },
  });
  if (!category) return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });

  const created = await prisma.habit.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
      weeklyDays: JSON.stringify(parsed.data.weeklyDays),
      monthlyDay: parsed.data.monthlyDay,
      color: parsed.data.color,
      reminderTime: parsed.data.reminderTime,
    },
  });

  return NextResponse.json({ habit: mapHabit(created) }, { status: 201 });
}
