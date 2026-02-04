import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const HabitFrequencySchema = z.union([z.literal("daily"), z.literal("weekly"), z.literal("monthly")]);
const EntryStatusSchema = z.union([z.literal("done"), z.literal("missed"), z.literal("skipped")]);

const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

const HabitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  categoryId: z.string().min(1),
  frequency: HabitFrequencySchema,
  weeklyDays: z.array(z.number().int().min(0).max(6)),
  monthlyDay: z.number().int().min(1).max(31).nullable(),
  color: z.string().min(1),
  reminderTime: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const EntrySchema = z.object({
  id: z.string().min(1),
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: EntryStatusSchema,
  note: z.string(),
  updatedAt: z.string(),
});

const BodySchema = z.object({
  categories: z.array(CategorySchema),
  habits: z.array(HabitSchema),
  entries: z.array(EntrySchema),
});

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.entry.deleteMany({ where: { userId: user.id } });
    await tx.habit.deleteMany({ where: { userId: user.id } });
    await tx.category.deleteMany({ where: { userId: user.id } });

    if (parsed.data.categories.length > 0) {
      await tx.category.createMany({
        data: parsed.data.categories.map((c) => ({
          userId: user.id,
          name: c.name,
          color: c.color,
        })),
      });
    }

    if (parsed.data.habits.length > 0) {
      await tx.habit.createMany({
        data: parsed.data.habits.map((h) => ({
          userId: user.id,
          categoryId: h.categoryId,
          name: h.name,
          description: h.description,
          frequency: h.frequency,
          weeklyDays: JSON.stringify(h.weeklyDays),
          monthlyDay: h.monthlyDay,
          color: h.color,
          reminderTime: h.reminderTime,
          createdAt: new Date(h.createdAt),
          updatedAt: new Date(h.updatedAt),
        })),
      });
    }

    if (parsed.data.entries.length > 0) {
      await tx.entry.createMany({
        data: parsed.data.entries.map((e) => ({
          userId: user.id,
          habitId: e.habitId,
          date: e.date,
          status: e.status,
          note: e.note,
          updatedAt: new Date(e.updatedAt),
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
