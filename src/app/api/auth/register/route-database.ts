import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  hashSessionToken,
  newSessionToken,
  sessionCookieName,
  sessionCookieOptions,
  sessionDays,
} from "@/lib/auth";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => {
      console.error('Failed to parse JSON body');
      return null;
    });
    
    console.log('Received JSON:', json);
    
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      console.error('Validation failed:', parsed.error);
      return NextResponse.json({ error: `Validation failed: ${parsed.error.message}` }, { status: 400 });
    }

    console.log('Parsed data:', parsed.data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
      },
    });

    // Create default categories with proper userId
    await prisma.category.createMany({
      data: [
        { name: "Health", color: "#22c55e", userId: user.id },
        { name: "Study", color: "#3b82f6", userId: user.id },
        { name: "Exercise", color: "#f97316", userId: user.id },
        { name: "Mind", color: "#a855f7", userId: user.id },
      ],
    });

    // Create session
    const token = newSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const res = NextResponse.json({ ok: true, user: { email: user.email } });
    res.cookies.set(sessionCookieName, token, sessionCookieOptions());
    return res;
  } catch (error: any) {
    console.error('Registration error:', error.message);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
