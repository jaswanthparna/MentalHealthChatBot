
interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: string;
  note: string;
  intensity: number;
  timestamp: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class MoodService {
  static async saveMoodEntry(entry: Omit<MoodEntry, 'id'>, token: string): Promise<MoodEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to save mood entry');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      // Fallback to local storage
      const moodEntry: MoodEntry = {
        ...entry,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      this.saveToLocalStorage(moodEntry);
      return moodEntry;
    }
  }

  static async getMoodEntries(userId: string, token: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    try {
      let url = `${API_BASE_URL}/mood/${userId}`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mood entries');
      }

      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      // Fallback to local storage
      return this.loadFromLocalStorage(userId);
    }
  }

  static async deleteMoodEntry(entryId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/mood/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete mood entry');
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      // Handle local storage cleanup if needed
    }
  }

  // Local storage fallback methods
  private static saveToLocalStorage(entry: MoodEntry): void {
    const key = `mood_entries_${entry.userId}`;
    const existing = localStorage.getItem(key);
    const entries = existing ? JSON.parse(existing) : [];
    
    // Replace existing entry for same date or add new
    const existingIndex = entries.findIndex((e: MoodEntry) => e.date === entry.date);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    localStorage.setItem(key, JSON.stringify(entries));
  }

  private static loadFromLocalStorage(userId: string): MoodEntry[] {
    const key = `mood_entries_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  static getMoodStats(entries: MoodEntry[]): {
    totalEntries: number;
    currentStreak: number;
    mostCommonMood: string;
    averageIntensity: number;
  } {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        mostCommonMood: 'N/A',
        averageIntensity: 0,
      };
    }

    // Calculate current streak
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Find most common mood
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    // Calculate average intensity
    const averageIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;

    return {
      totalEntries: entries.length,
      currentStreak,
      mostCommonMood,
      averageIntensity: Math.round(averageIntensity),
    };
  }
}
