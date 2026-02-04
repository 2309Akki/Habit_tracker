import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const EntryStatusSchema = z.union([z.literal("done"), z.literal("missed"), z.literal("skipped")]);

const UpsertEntrySchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: EntryStatusSchema,
  note: z.string().optional(),
});

const DeleteEntrySchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

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

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const where: Record<string, unknown> = { userId: user.id };
  if (from && to) {
    where.date = { gte: from, lte: to };
  }

  const entries = await prisma.entry.findMany({
    where,
    orderBy: [{ date: "asc" }, { updatedAt: "asc" }],
  });

  return NextResponse.json({ entries: entries.map(mapEntry) });
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = UpsertEntrySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const habit = await prisma.habit.findFirst({
    where: { id: parsed.data.habitId, userId: user.id },
    select: { id: true },
  });
  if (!habit) return NextResponse.json({ error: "Invalid habitId" }, { status: 400 });

  const entry = await prisma.entry.upsert({
    where: {
      userId_habitId_date: {
        userId: user.id,
        habitId: parsed.data.habitId,
        date: parsed.data.date,
      },
    },
    create: {
      userId: user.id,
      habitId: parsed.data.habitId,
      date: parsed.data.date,
      status: parsed.data.status,
      note: parsed.data.note ?? "",
    },
    update: {
      status: parsed.data.status,
      note: parsed.data.note,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ entry: mapEntry(entry) });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = DeleteEntrySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.entry.deleteMany({
    where: {
      userId: user.id,
      habitId: parsed.data.habitId,
      date: parsed.data.date,
    },
  });

  return NextResponse.json({ ok: true });
}
