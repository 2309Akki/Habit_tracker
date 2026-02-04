import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const HabitFrequencySchema = z.union([z.literal("daily"), z.literal("weekly"), z.literal("monthly")]);

const UpdateHabitSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional(),
    categoryId: z.string().min(1).optional(),
    frequency: HabitFrequencySchema.optional(),
    weeklyDays: z.array(z.number().int().min(0).max(6)).optional(),
    monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
    color: z.string().min(1).max(32).optional(),
    reminderTime: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch" });

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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parsed = UpdateHabitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.id },
      select: { id: true },
    });
    if (!cat) return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.weeklyDays) data.weeklyDays = JSON.stringify(parsed.data.weeklyDays);

  const updated = await prisma.habit.updateMany({
    where: { id, userId: user.id },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const habit = await prisma.habit.findFirst({ where: { id, userId: user.id } });
  return NextResponse.json({ habit: habit ? mapHabit(habit) : null });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const deleted = await prisma.habit.deleteMany({
    where: { id, userId: user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
