// FIXED Sync Replace API - Your Schema
import { NextRequest, NextResponse } from 'next/server';
import { sessions, userData } from '@/lib/simple-store';

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const token = req.cookies.get('ht_session')?.value;
    if (!token) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    const user = await sessions.get(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get data from request
    const data = await req.json();
    
    console.log('🔄 SYNC - Replacing habits for user:', user.email);
    console.log('📋 SYNC - New habits data:', data);

    // Save habits with automatic sorting
    const savedHabits = await userData.set(user.email, data);
    
    console.log('✅ SYNC - Habits saved:', savedHabits);
    
    return NextResponse.json({ 
      ok: true,
      habits: savedHabits 
    });
    
  } catch (error: any) {
    console.error('Sync replace error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const token = req.cookies.get('ht_session')?.value;
    if (!token) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    const user = await sessions.get(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get current habits
    const habits = await userData.get(user.email);
    
    console.log('📊 SYNC - Current habits:', habits);
    
    return NextResponse.json({ 
      habits: habits || []
    });
    
  } catch (error: any) {
    console.error('Sync get error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
