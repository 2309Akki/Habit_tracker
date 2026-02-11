// WORKING User Store - Fixed for Your Schema
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "ht_session";

// Helper functions
export const newSessionToken = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/'
});

// Simple validation
export const BodySchema = {
  safeParse: (data: any) => {
    try {
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Simple User Store - Direct Object Operations
export const users = {
  async get(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
  
  async set(email: string, userData: any) {
    try {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: userData.passwordHash || userData.password, // Handle both
          habits: userData.habits || []
        }
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },
  
  async has(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      return !!user;
    } catch (error) {
      console.error('Error checking user exists:', error);
      return false;
    }
  },
  
  async updateHabits(email: string, habits: any) {
    try {
      // Sort dates in ascending order for each habit
      const sortedHabits = habits.map((habitGroup: any) => {
        const sortedHabit: any = {};
        Object.keys(habitGroup).forEach(habitName => {
          const dates = habitGroup[habitName];
          // Sort dates in ascending order
          const sortedDates = Array.isArray(dates) 
            ? [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            : [];
          sortedHabit[habitName] = sortedDates;
        });
        return sortedHabit;
      });
      
      const updatedUser = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { 
          habits: sortedHabits,
          updatedAt: new Date()
        }
      });
      return updatedUser;
    } catch (error) {
      console.error('Error updating habits:', error);
      return null;
    }
  }
};

// Session Store
export const sessions = {
  async get(token: string) {
    try {
      const session = await prisma.session.findFirst({
        where: {
          tokenHash: require('crypto').createHash('sha256').update(token).digest('hex'),
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });
      return session?.user || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },
  
  async set(token: string, user: any) {
    try {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  },
  
  async delete(token: string) {
    try {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      await prisma.session.deleteMany({
        where: { tokenHash }
      });
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  },
  
  async has(token: string) {
    try {
      const session = await prisma.session.findFirst({
        where: {
          tokenHash: require('crypto').createHash('sha256').update(token).digest('hex'),
          expiresAt: { gt: new Date() }
        }
      });
      return !!session;
    } catch (error) {
      console.error('Error checking session exists:', error);
      return false;
    }
  }
};

// Simple User Data Operations
export const userData = {
  async get(userId: string) {
    try {
      console.log('🔍 GET - Getting user data for:', userId);
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        console.log('❌ GET - User not found');
        return [];
      }
      
      console.log('✅ GET - User found with habits:', user.habits);
      return user.habits || [];
    } catch (error) {
      console.error('❌ GET Error:', error);
      return [];
    }
  },
  
  async set(userId: string, habits: any) {
    try {
      console.log('💾 SET - Saving habits for:', userId);
      console.log('📋 SET - Habits to save:', habits);
      
      // Sort dates in ascending order for each habit
      const sortedHabits = habits.map((habitGroup: any) => {
        const sortedHabit: any = {};
        Object.keys(habitGroup).forEach(habitName => {
          const dates = habitGroup[habitName];
          // Sort dates in ascending order
          const sortedDates = Array.isArray(dates) 
            ? [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            : [];
          sortedHabit[habitName] = sortedDates;
        });
        return sortedHabit;
      });
      
      console.log('📅 SET - Sorted habits:', sortedHabits);
      
      const updatedUser = await prisma.user.update({
        where: { email: userId },
        data: { 
          habits: sortedHabits,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ SET - Habits saved successfully');
      return updatedUser.habits || sortedHabits;
    } catch (error) {
      console.error('❌ SET Error:', error);
      throw error;
    }
  },
  
  // Add date to habit (automatically sorts)
  async addDate(userId: string, habitName: string, date: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user || !user.habits) {
        return false;
      }
      
      const habits = [...(user.habits as any[])];
      let habitGroup = habits.find((h: any) => h[habitName]);
      
      if (!habitGroup) {
        habitGroup = { [habitName]: [] };
        habits.push(habitGroup);
      }
      
      // Add date and sort
      const dates = [...(habitGroup[habitName] || []), date];
      const sortedDates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      habitGroup[habitName] = sortedDates;
      
      await prisma.user.update({
        where: { email: userId },
        data: { habits, updatedAt: new Date() }
      });
      
      return true;
    } catch (error) {
      console.error('Error adding date:', error);
      return false;
    }
  },
  
  // Remove date from habit
  async removeDate(userId: string, habitName: string, date: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user || !user.habits) {
        return false;
      }
      
      const habits = [...(user.habits as any[])];
      const habitGroup = habits.find((h: any) => h[habitName]);
      
      if (!habitGroup || !habitGroup[habitName]) {
        return false;
      }
      
      // Remove date
      const dates = habitGroup[habitName].filter((d: any) => d !== date);
      habitGroup[habitName] = dates;
      
      await prisma.user.update({
        where: { email: userId },
        data: { habits, updatedAt: new Date() }
      });
      
      return true;
    } catch (error) {
      console.error('Error removing date:', error);
      return false;
    }
  }
};
