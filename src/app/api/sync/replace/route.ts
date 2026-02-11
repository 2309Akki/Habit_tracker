import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sessionCookieName, userData, sessions } from "@/lib/simple-store";

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
  weeklyDays: z.array(z.number()),
  monthlyDay: z.number().nullable(),
  color: z.string().min(1),
  reminderTime: z.string().nullable(),
});

const EntrySchema = z.object({
  id: z.string().min(1),
  habitId: z.string().min(1),
  date: z.string().min(1),
  status: EntryStatusSchema,
  note: z.string(),
});

const BodySchema = z.object({
  categories: z.array(CategorySchema),
  habits: z.array(HabitSchema),
  entries: z.array(EntrySchema),
});

export async function POST(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = req.cookies.get(sessionCookieName)?.value;
    console.log('Replace - Received token:', token);
    
    if (!token) {
      console.log('No token found in replace request');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user from session to get their email
    const user = await sessions.get(token);
    if (!user) {
      console.log('No user found for token');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      console.log('Invalid body in replace request:', parsed.error);
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // Use email as user ID for consistency
    const userId = user.email;
    console.log('Replace - Saving data for user:', userId);
    
    // Add userId to all items
    const dataWithUserId = {
      categories: parsed.data.categories.map(cat => ({ ...cat, userId })),
      habits: parsed.data.habits.map(habit => ({ ...habit, userId })),
      entries: parsed.data.entries.map(entry => ({ ...entry, userId }))
    };
    
    // Save user data to persistent store
    userData.set(userId, dataWithUserId);
    
    console.log('Replace - Saved user data:', {
      categories: dataWithUserId.categories.length,
      habits: dataWithUserId.habits.length,
      entries: dataWithUserId.entries.length
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('Replace error:', error.message);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
