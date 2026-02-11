// FINAL WORKING SOLUTION - Complete Fix for Data Persistence
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "ht_session";

// User store
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

// Session store
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

// FINAL WORKING USER DATA STORE
export const userData = {
  async get(userId: string) {
    try {
      console.log('🔍 userData.get - Looking for userId:', userId);
      
      // Get user by email to get user ID
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        console.log('❌ userData.get - User not found');
        return { categories: [], habits: [], entries: [] };
      }
      
      console.log('✅ userData.get - User ID:', user.id);
      
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

      console.log('📊 userData.get - Raw results:', {
        categories: categories.length,
        habits: habits.length,
        entries: entries.length
      });

      // Return data with proper structure
      const result = {
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

      console.log('🎯 userData.get - Final result:', {
        categories: result.categories.length,
        habits: result.habits.length,
        entries: result.entries.length
      });

      return result;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return { categories: [], habits: [], entries: [] };
    }
  },
  
  async set(userId: string, data: any) {
    try {
      console.log('💾 userData.set - Starting save for userId:', userId);
      
      // Get user by email
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('👤 userData.set - User ID:', user.id);
      console.log('📋 userData.set - Data to save:', {
        categories: data.categories?.length || 0,
        habits: data.habits?.length || 0,
        entries: data.entries?.length || 0
      });

      // Delete existing data
      await prisma.entry.deleteMany({ where: { userId: user.id } });
      await prisma.habit.deleteMany({ where: { userId: user.id } });
      await prisma.category.deleteMany({ where: { userId: user.id } });

      // Save categories first
      if (data.categories && data.categories.length > 0) {
        console.log('📁 Saving categories...');
        const savedCategories = await prisma.category.createMany({
          data: data.categories.map((cat: any) => ({
            name: cat.name,
            color: cat.color,
            userId: user.id
          }))
        });
        console.log('✅ Categories saved:', savedCategories.count);
      }

      // Save habits with proper category mapping
      if (data.habits && data.habits.length > 0) {
        console.log('🎯 Saving habits...');
        
        // Get saved categories to map names to IDs
        const categories = await prisma.category.findMany({
          where: { userId: user.id }
        });
        
        const categoryMap = new Map();
        categories.forEach(cat => {
          categoryMap.set(cat.name, cat.id);
        });
        
        console.log('🗺 Category map:', Object.fromEntries(categoryMap));
        
        const habitsToSave = data.habits.map((habit: any) => {
          // Handle both string names and ObjectIds
          let mappedCategoryId = habit.categoryId;
          
          // If categoryId is a string name, map it to MongoDB ObjectId
          if (typeof habit.categoryId === 'string' && !habit.categoryId.match(/^[0-9a-f]{24}$/i)) {
            mappedCategoryId = categoryMap.get(habit.categoryId);
            console.log(`🔄 Mapping category: ${habit.categoryId} -> ${mappedCategoryId}`);
          }
          
          return {
            name: habit.name,
            description: habit.description,
            categoryId: mappedCategoryId,
            frequency: habit.frequency,
            weeklyDays: JSON.stringify(habit.weeklyDays || []),
            monthlyDay: habit.monthlyDay,
            color: habit.color,
            reminderTime: habit.reminderTime,
            userId: user.id
          };
        });
        
        const savedHabits = await prisma.habit.createMany({
          data: habitsToSave
        });
        console.log('✅ Habits saved:', savedHabits.count);
      }

      // Save entries with proper habit mapping
      if (data.entries && data.entries.length > 0) {
        console.log('📝 Saving entries...');
        
        // Get saved habits to map names to IDs
        const habits = await prisma.habit.findMany({
          where: { userId: user.id }
        });
        
        const habitMap = new Map();
        habits.forEach(habit => {
          habitMap.set(habit.name, habit.id);
        });
        
        console.log('🗺 Habit map:', Object.fromEntries(habitMap));
        
        const entriesToSave = data.entries.map((entry: any) => {
          // Handle both string names and ObjectIds
          let mappedHabitId = entry.habitId;
          
          // If habitId is a string name, map it to MongoDB ObjectId
          if (typeof entry.habitId === 'string' && !entry.habitId.match(/^[0-9a-f]{24}$/i)) {
            mappedHabitId = habitMap.get(entry.habitId);
            console.log(`🔄 Mapping habit: ${entry.habitId} -> ${mappedHabitId}`);
          }
          
          return {
            habitId: mappedHabitId,
            date: entry.date,
            status: entry.status,
            note: entry.note,
            userId: user.id
          };
        });
        
        const savedEntries = await prisma.entry.createMany({
          data: entriesToSave
        });
        console.log('✅ Entries saved:', savedEntries.count);
      }

      console.log('🎉 userData.set - Save completed successfully');
      return data;
    } catch (error) {
      console.error('❌ Error setting user data:', error);
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
      console.error('❌ Error updating user data:', error);
      throw error;
    }
  }
};
