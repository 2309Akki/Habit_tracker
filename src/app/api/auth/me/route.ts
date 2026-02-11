import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, sessions } from "@/lib/simple-store";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(sessionCookieName)?.value;
    console.log('Auth me - Received token:', token);
    console.log('Request time:', new Date().toISOString());
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // Get user from session
    const user = await sessions.get(token);
    if (!user) {
      console.log('No user found for token');
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    console.log('Returning real user for token:', user.email);
    
    // Return real user data
    return NextResponse.json({ user: { 
      email: user.email,
      id: user.id,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }}, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('Auth status error:', error.message);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
