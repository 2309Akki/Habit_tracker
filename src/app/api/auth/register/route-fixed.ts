// FIXED Registration API - Your Schema
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { BodySchema, users, sessions, newSessionToken, sessionCookieOptions } from '@/lib/simple-store';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await users.has(parsed.data.email.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    // Create user with your schema
    const user = await users.set(parsed.data.email.toLowerCase(), {
      passwordHash: passwordHash,
      habits: [] // Start with empty habits
    });

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
    
    // Create session
    const token = newSessionToken();
    await sessions.set(token, user);
    
    const res = NextResponse.json({ 
      ok: true, 
      user: { 
        id: user.id,
        email: user.email,
        habits: (user as any).habits || []
      } 
    });
    
    res.cookies.set(sessionCookieName, token, sessionCookieOptions());
    return res;
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
