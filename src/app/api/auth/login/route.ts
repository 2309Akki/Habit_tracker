import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { users, sessions } from "@/lib/simple-store";

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
    const user = await users.get(email);
    console.log('Looking for user with email:', email);
    console.log('Found user:', user);
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session token
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions.set(token, user);
    
    console.log('Login successful for:', email);

    const res = NextResponse.json({ ok: true, user: { email: user.email } });
    res.cookies.set("ht_session", token, { 
      httpOnly: true, 
      sameSite: "lax", 
      secure: false, 
      path: "/", 
      maxAge: 60 * 60 * 24 * 30 
    });
    return res;
  } catch (error: any) {
    console.error('Login error:', error.message);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
