import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, sessions } from "@/lib/simple-store";

export async function POST(req: NextRequest) {
  try {
    // Simple logout that doesn't require database
    const res = NextResponse.json({ ok: true });
    
    // Get session token from request
    const token = req.cookies.get(sessionCookieName)?.value;
    console.log('Logout - Received token:', token);
    
    if (token) {
      // Remove session from store
      await sessions.delete(token);
      console.log('Session removed from store:', token);
    }
    
    // Clear session cookie
    res.cookies.set(sessionCookieName, "", { 
      httpOnly: true, 
      path: "/", 
      maxAge: 0 
    });
    
    console.log('User logged out successfully');
    return res;
  } catch (error: any) {
    console.error('Logout error:', error.message);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
