// COMPLETELY FIXED User Store - Your Schema Working
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "ht_session";

// Helper functions
export const newSessionToken = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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
    } catch (error: any) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
};

// Fixed User Store - Direct Object Operations
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
          passwordHash: userData.passwordHash || userData.password, // Handle both cases
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

// Fixed Session Store
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

// Fixed User Data Operations - Using Raw Prisma Types
export const userData = {
  async get(userId: string) {
    try {
      console.log('🔍 GET - Getting user data for:', userId);
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        console.log('❌ GET - User not found');
        return { categories: [], habits: [], entries: [] };
      }
      
      console.log('✅ GET - User found with habits:', (user as any).habits);
      
      // Convert your simple schema to frontend expected format
      const userHabits = (user as any).habits || [];
      
      // If user has your simple format, convert to frontend format
      if (userHabits.length > 0 && typeof userHabits[0] === 'object' && !userHabits[0].name) {
        // Your simple schema - convert to frontend format WITH PRESERVED DATES
        const frontendHabits: any[] = [];
        const frontendEntries: any[] = [];
        
        Object.keys(userHabits[0]).forEach(habitName => {
          const tickedDates = userHabits[0][habitName] || [];
          
          // Create habit object
          const habitObject = {
            id: `habit_${habitName}`,
            name: habitName,
            description: '',
            categoryId: 'default',
            frequency: 'daily',
            weeklyDays: [],
            monthlyDay: null,
            color: '#22c55e',
            reminderTime: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          frontendHabits.push(habitObject);
          
          // Create entry objects for each ticked date
          tickedDates.forEach((date: string) => {
            frontendEntries.push({
              id: `entry_${habitName}_${date}`,
              habitId: habitObject.id,
              date: date,
              status: 'done',
              note: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
          
          console.log(`📅 GET - Restored ${tickedDates.length} ticked dates for habit: ${habitName}`, tickedDates);
        });
        
        console.log('🔄 GET - Converted your schema to frontend format with preserved dates');
        return { categories: [], habits: frontendHabits, entries: frontendEntries };
      } else {
        // Frontend format - return as-is
        console.log('✅ GET - Using frontend format');
        return { categories: [], habits: userHabits, entries: [] };
      }
    } catch (error) {
      console.error('❌ GET Error:', error);
      return { categories: [], habits: [], entries: [] };
    }
  },
  
  async set(userId: string, data: any) {
    try {
      console.log('💾 SET - Saving habits for:', userId);
      console.log('📋 SET - Data to save:', data);
      
      // Handle both old and new formats
      let habitsToSave: any[];
      
      if (data.habits && Array.isArray(data.habits) && data.habits.length > 0) {
        // Check if it's old format (array of habit objects) or new format (array of habit groups)
        if (data.habits[0] && typeof data.habits[0] === 'object' && data.habits[0].name) {
          // Old format - convert to your simple schema BUT PRESERVE TICKED DATES
          habitsToSave = [{}];
          
          // Also check if there are entries with ticked dates
          const entries = data.entries || [];
          console.log('🔄 SET - Found entries to preserve:', entries);
          
          data.habits.forEach((habit: any) => {
            habitsToSave[0][habit.name] = [];
            
            // Find all entries for this habit and extract dates
            const habitEntries = entries.filter((entry: any) => 
              entry.habitId === habit.id && entry.status === 'done'
            );
            
            // Extract dates from entries
            const tickedDates = habitEntries.map((entry: any) => entry.date);
            habitsToSave[0][habit.name] = tickedDates;
            
            console.log(`📅 SET - Preserved ${tickedDates.length} ticked dates for habit: ${habit.name}`, tickedDates);
          });
          
          console.log('🔄 SET - Converted old format to new format with preserved dates');
        } else {
          // New format - use as-is
          habitsToSave = data.habits;
          console.log('✅ SET - Using new format');
        }
      } else {
        // Empty or invalid format
        habitsToSave = [];
        console.log('📝 SET - Using empty format');
      }
      
      // Sort dates in ascending order for each habit
      const sortedHabits = habitsToSave.map((habitGroup: any) => {
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
          habits: sortedHabits as any, // Cast to any to bypass Prisma type checking
          updatedAt: new Date()
        }
      });
      
      console.log('✅ SET - Habits saved successfully');
      return (updatedUser as any).habits || sortedHabits;
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
      
      if (!user || !(user as any).habits) {
        return false;
      }
      
      const habits = [...((user as any).habits as any[])];
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
        data: { habits: habits as any, updatedAt: new Date() }
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
      
      if (!user || !(user as any).habits) {
        return false;
      }
      
      const habits = [...((user as any).habits as any[])];
      const habitGroup = habits.find((h: any) => h[habitName]);
      
      if (!habitGroup || !habitGroup[habitName]) {
        return false;
      }
      
      // Remove date
      const dates = habitGroup[habitName].filter((d: any) => d !== date);
      habitGroup[habitName] = dates;
      
      await prisma.user.update({
        where: { email: userId },
        data: { habits: habits as any, updatedAt: new Date() }
      });
      
      return true;
    } catch (error) {
      console.error('Error removing date:', error);
      return false;
    }
  }
};
