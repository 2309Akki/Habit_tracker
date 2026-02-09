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
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      categories: {
        create: [
          { name: "Health", color: "#22c55e" },
          { name: "Study", color: "#3b82f6" },
          { name: "Exercise", color: "#f97316" },
          { name: "Mind", color: "#a855f7" },
        ],
      },
    },
  });

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
}
