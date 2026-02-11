// Simple working version of data store
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "ht_session";

// Simple user store
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
          passwordHash: userData.passwordHash,
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
  }
};

// Simple session store
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
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
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

// Simple user data store
export const userData = {
  async get(userId: string) {
    try {
      console.log('userData.get - Looking for userId:', userId);
      
      // Get user by email to get user ID
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        console.log('userData.get - User not found');
        return { categories: [], habits: [], entries: [] };
      }
      
      console.log('userData.get - User ID:', user.id);
      
      // Get all user data using user's MongoDB ID
      const [categories, habits, entries] = await Promise.all([
        prisma.category.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" }
        }),
        prisma.habit.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" }
        }),
        prisma.entry.findMany({
          where: { userId: user.id },
          orderBy: [{ date: "asc" }, { updatedAt: "asc" }]
        })
      ]);

      console.log('userData.get - Raw results:', {
        categories: categories.length,
        habits: habits.length,
        entries: entries.length
      });

      return {
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          userId: userId,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString()
        })),
        habits: habits.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description,
          categoryId: h.categoryId,
          frequency: h.frequency,
          weeklyDays: JSON.parse(h.weeklyDays || '[]'),
          monthlyDay: h.monthlyDay,
          color: h.color,
          reminderTime: h.reminderTime,
          userId: userId,
          createdAt: h.createdAt.toISOString(),
          updatedAt: h.updatedAt.toISOString()
        })),
        entries: entries.map(e => ({
          id: e.id,
          habitId: e.habitId,
          date: e.date,
          status: e.status,
          note: e.note,
          userId: userId,
          createdAt: e.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: e.updatedAt?.toISOString() || new Date().toISOString()
        }))
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { categories: [], habits: [], entries: [] };
    }
  },
  async set(userId: string, data: any) {
    try {
      // Get user by email
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('userData.set - User ID:', user.id);
      console.log('userData.set - Data to save:', {
        categories: data.categories?.length || 0,
        habits: data.habits?.length || 0,
        entries: data.entries?.length || 0
      });

      // Delete existing data
      await prisma.entry.deleteMany({ where: { userId: user.id } });
      await prisma.habit.deleteMany({ where: { userId: user.id } });
      await prisma.category.deleteMany({ where: { userId: user.id } });

      // Insert new categories
      if (data.categories && data.categories.length > 0) {
        console.log('Saving categories...');
        await prisma.category.createMany({
          data: data.categories.map((cat: any) => ({
            name: cat.name, // Use actual name
            color: cat.color,
            userId: user.id
          }))
        });
      }

      // Insert new habits
      if (data.habits && data.habits.length > 0) {
        console.log('Saving habits...');
        // Get categories to map categoryId
        const categories = await prisma.category.findMany({
          where: { userId: user.id }
        });
        
        const categoryMap = new Map();
        categories.forEach(cat => {
          categoryMap.set(cat.name, cat.id);
        });
        
        await prisma.habit.createMany({
          data: data.habits.map((habit: any) => ({
            name: habit.name,
            description: habit.description,
            categoryId: categoryMap.get(habit.categoryName) || habit.categoryId,
            frequency: habit.frequency,
            weeklyDays: JSON.stringify(habit.weeklyDays || []),
            monthlyDay: habit.monthlyDay,
            color: habit.color,
            reminderTime: habit.reminderTime,
            userId: user.id
          }))
        });
      }

      // Insert new entries
      if (data.entries && data.entries.length > 0) {
        console.log('Saving entries...');
        // Get habits to map habitId
        const habits = await prisma.habit.findMany({
          where: { userId: user.id }
        });
        
        const habitMap = new Map();
        habits.forEach(habit => {
          habitMap.set(habit.name, habit.id);
        });
        
        await prisma.entry.createMany({
          data: data.entries.map((entry: any) => ({
            habitId: habitMap.get(entry.habitName) || entry.habitId,
            date: entry.date,
            status: entry.status,
            note: entry.note,
            userId: user.id
          }))
        });
      }

      return data;
    } catch (error) {
      console.error('Error setting user data:', error);
      throw error;
    }
  },
  async update(userId: string, newData: any) {
    try {
      const existingData = await this.get(userId);
      const updatedData = { ...existingData, ...newData };
      await this.set(userId, updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
};
