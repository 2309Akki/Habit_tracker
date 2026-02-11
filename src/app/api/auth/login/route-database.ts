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
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => {
      console.error('Failed to parse JSON body');
      return null;
    });
    
    console.log('Login received JSON:', json);
    
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      console.error('Validation failed:', parsed.error);
      return NextResponse.json({ error: `Validation failed: ${parsed.error.message}` }, { status: 400 });
    }

    console.log('Login parsed data:', parsed.data);

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
    console.error('Login error:', error.message);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
