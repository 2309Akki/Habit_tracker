// FIXED Pull API - Your Simple Schema
import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, userData, sessions } from "@/lib/simple-store";

export async function GET(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = req.cookies.get(sessionCookieName)?.value;
    console.log('Pull - Received token:', token);
    
    if (!token) {
      console.log('No token found in pull request');
      return NextResponse.json({ 
        habits: []
      }, { status: 200 });
    }

    // Get user from session to get their email
    const user = await sessions.get(token);
    if (!user) {
      console.log('No user found for token:', token);
      return NextResponse.json({ 
        habits: []
      }, { status: 200 });
    }
    
    console.log('Found user in session:', user.email);
    
    // Use email as user ID for consistency
    const userId = user.email;
    console.log('Pull - Getting data for user:', userId);
    
    // Get user's actual habits from persistent store
    const userHabits = await userData.get(userId);
    console.log('Pull - Retrieved user habits:', userHabits);
    
    console.log('Pull - Raw data:', JSON.stringify(userHabits, null, 2));
    
    // Return only the user's actual saved habits (your schema)
    return NextResponse.json({ 
      habits: userHabits || []
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Pull error:', error.message);
    return NextResponse.json({ 
      habits: []
    }, { status: 500 });
  }
}
