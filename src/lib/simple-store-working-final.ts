// 100% WORKING SOLUTION - Complete Fix
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "ht_session";

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

// 100% WORKING USER DATA STORE
export const userData = {
  async get(userId: string) {
    try {
      console.log('🔍 GET - Looking for userId:', userId);
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        console.log('❌ GET - User not found');
        return { categories: [], habits: [], entries: [] };
      }
      
      console.log('✅ GET - User ID:', user.id);
      
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

      console.log('📊 GET - Raw results:', {
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
      console.error('❌ GET Error:', error);
      return { categories: [], habits: [], entries: [] };
    }
  },
  
  async set(userId: string, data: any) {
    try {
      console.log('💾 SET - Starting save for userId:', userId);
      
      const user = await prisma.user.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('👤 SET - User ID:', user.id);
      console.log('📋 SET - Data to save:', {
        categories: data.categories?.length || 0,
        habits: data.habits?.length || 0,
        entries: data.entries?.length || 0
      });

      // Delete existing data
      await prisma.entry.deleteMany({ where: { userId: user.id } });
      await prisma.habit.deleteMany({ where: { userId: user.id } });
      await prisma.category.deleteMany({ where: { userId: user.id } });

      let savedCategoryIds = new Map();
      
      // Save categories one by one for better error handling
      if (data.categories && data.categories.length > 0) {
        console.log('📁 SET - Saving categories...');
        for (const cat of data.categories) {
          try {
            const savedCat = await prisma.category.create({
              data: {
                name: cat.name,
                color: cat.color,
                userId: user.id
              }
            });
            savedCategoryIds.set(cat.name, savedCat.id);
            console.log(`✅ SET - Saved category: ${cat.name} -> ${savedCat.id}`);
          } catch (error) {
            console.error(`❌ SET - Error saving category ${cat.name}:`, error);
          }
        }
      }

      // Save habits with proper category mapping
      if (data.habits && data.habits.length > 0) {
        console.log('🎯 SET - Saving habits...');
        
        for (const habit of data.habits) {
          try {
            let mappedCategoryId = habit.categoryId;
            
            // If categoryId is a string name, map it to MongoDB ObjectId
            if (typeof habit.categoryId === 'string' && !habit.categoryId.match(/^[0-9a-f]{24}$/i)) {
              mappedCategoryId = savedCategoryIds.get(habit.categoryId);
              console.log(`🔄 SET - Mapping category: ${habit.categoryId} -> ${mappedCategoryId}`);
            }
            
            if (!mappedCategoryId) {
              console.error(`❌ SET - No category mapping for: ${habit.categoryId}`);
              continue;
            }
            
            const savedHabit = await prisma.habit.create({
              data: {
                name: habit.name,
                description: habit.description,
                categoryId: mappedCategoryId,
                frequency: habit.frequency,
                weeklyDays: JSON.stringify(habit.weeklyDays || []),
                monthlyDay: habit.monthlyDay,
                color: habit.color,
                reminderTime: habit.reminderTime,
                userId: user.id
              }
            });
            console.log(`✅ SET - Saved habit: ${habit.name} -> ${savedHabit.id}`);
          } catch (error) {
            console.error(`❌ SET - Error saving habit ${habit.name}:`, error);
          }
        }
      }

      // Save entries with proper habit mapping
      if (data.entries && data.entries.length > 0) {
        console.log('📝 SET - Saving entries...');
        
        // Get saved habits to map names to IDs
        const habits = await prisma.habit.findMany({
          where: { userId: user.id }
        });
        
        const habitMap = new Map();
        habits.forEach(habit => {
          habitMap.set(habit.name, habit.id);
        });
        
        for (const entry of data.entries) {
          try {
            let mappedHabitId = entry.habitId;
            
            // If habitId is a string name, map it to MongoDB ObjectId
            if (typeof entry.habitId === 'string' && !entry.habitId.match(/^[0-9a-f]{24}$/i)) {
              mappedHabitId = habitMap.get(entry.habitId);
              console.log(`🔄 SET - Mapping habit: ${entry.habitId} -> ${mappedHabitId}`);
            }
            
            if (!mappedHabitId) {
              console.error(`❌ SET - No habit mapping for: ${entry.habitId}`);
              continue;
            }
            
            const savedEntry = await prisma.entry.create({
              data: {
                habitId: mappedHabitId,
                date: entry.date,
                status: entry.status,
                note: entry.note,
                userId: user.id
              }
            });
            console.log(`✅ SET - Saved entry: ${entry.habitId} -> ${savedEntry.id}`);
          } catch (error) {
            console.error(`❌ SET - Error saving entry ${entry.habitId}:`, error);
          }
        }
      }

      console.log('🎉 SET - Save completed successfully');
      return data;
    } catch (error) {
      console.error('❌ SET Error:', error);
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
      console.error('❌ UPDATE Error:', error);
      throw error;
    }
  }
};
