// Streak veri tipleri
export interface StreakData {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastPracticeDate: string;
  weeklyGoal: number;
  weeklyProgress: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyActivity {
  id?: string;
  userId: string;
  date: string;
  practiced: boolean;
  duration: number; // dakika
  poses: string[];
  quality: 'excellent' | 'good' | 'fair';
  xpEarned: number;
  createdAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
}

class StreakService {
  private readonly baseUrl = 'http://localhost:5171/api/YogaStreak'; // Backend port ve controller adı

  // Authorization header'ını getir
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('yogaii_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Kullanıcının streak verilerini getir
  async getUserStreak(userId: string): Promise<StreakData> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Streak verileri alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Streak verileri alınırken hata:', error);
      // Backend bağlanamıyorsa mock data döndür
      return this.getMockStreakData(userId);
    }
  }

  // Günlük aktivite ekle
  async addDailyActivity(activity: Omit<DailyActivity, 'id' | 'xpEarned' | 'createdAt'>): Promise<DailyActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/activity`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...activity,
          date: new Date(activity.date).toISOString(),
          xpEarned: 0 // Backend tarafından hesaplanacak
        }),
      });

      if (!response.ok) {
        throw new Error(`Aktivite eklenemedi: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Aktivite eklenirken hata:', error);
      // Mock data ile simüle et
      const mockActivity: DailyActivity = {
        ...activity,
        id: Date.now().toString(),
        xpEarned: this.calculateMockXP(activity.duration, activity.poses.length, activity.quality),
        createdAt: new Date().toISOString()
      };
      return mockActivity;
    }
  }

  // Haftalık aktiviteleri getir
  async getWeeklyActivities(userId: string): Promise<DailyActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/${userId}/week`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Haftalık aktiviteler alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Haftalık aktiviteler alınırken hata:', error);
      // Backend bağlanamıyorsa mock data döndür
      return this.getMockWeeklyActivities(userId);
    }
  }

  // Başarımları getir
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Başarımlar alınamadı: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Başarımlar alınırken hata:', error);
      // Backend bağlanamıyorsa mock data döndür
      return this.getMockAchievements(userId);
    }
  }

  // Simüle edilmiş veriler (geliştirme aşaması için)
  getMockStreakData(userId: string): StreakData {
    return {
      userId,
      currentStreak: 7,
      longestStreak: 15,
      totalDays: 42,
      lastPracticeDate: new Date().toISOString(),
      weeklyGoal: 5,
      weeklyProgress: 4,
      level: 3,
      xp: 1250,
      xpToNextLevel: 250
    };
  }

  getMockWeeklyActivities(userId: string): DailyActivity[] {
    const today = new Date();
    const activities: DailyActivity[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const practiced = Math.random() > 0.3; // %70 ihtimalle yoga yapmış
      const duration = practiced ? Math.floor(Math.random() * 40) + 15 : 0; // 15-55 dakika
      const poses = practiced ? this.getRandomPoses() : [];
      const quality = practiced ? this.getRandomQuality() : 'fair';
      
      activities.push({
        userId,
        date: date.toISOString(),
        practiced,
        duration,
        poses,
        quality,
        xpEarned: practiced ? this.calculateMockXP(duration, poses.length, quality) : 0
      });
    }
    
    return activities;
  }

  getMockAchievements(userId: string): Achievement[] {
    return [
      {
        id: 'first_day',
        title: 'İlk Adım',
        description: 'İlk yoga seansını tamamladın!',
        icon: 'star',
        isUnlocked: true,
        unlockedDate: '2024-01-01',
        progress: 1,
        maxProgress: 1
      },
      {
        id: 'week_streak',
        title: '7 Günlük Seri',
        description: '7 gün üst üste yoga yaptın',
        icon: 'fire',
        isUnlocked: true,
        unlockedDate: '2024-01-08',
        progress: 7,
        maxProgress: 7
      },
      {
        id: 'month_streak',
        title: 'Ay Boyu Devam',
        description: '30 gün üst üste yoga yap',
        icon: 'trophy',
        isUnlocked: false,
        progress: 7,
        maxProgress: 30
      },
      {
        id: 'early_bird',
        title: 'Erken Kuş',
        description: 'Sabah 8\'den önce 10 kez yoga yap',
        icon: 'timer',
        isUnlocked: false,
        progress: 3,
        maxProgress: 10
      },
      {
        id: 'level_5',
        title: 'Yoga Uzmanı',
        description: '5. seviyeye ulaş',
        icon: 'medal',
        isUnlocked: false,
        progress: 3,
        maxProgress: 5
      }
    ];
  }

  // Yardımcı metodlar
  private getRandomPoses(): string[] {
    const allPoses = ['downdog', 'goddess', 'plank', 'tree', 'warrior2'];
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 poz
    const shuffled = allPoses.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getRandomQuality(): 'excellent' | 'good' | 'fair' {
    const rand = Math.random();
    if (rand < 0.3) return 'excellent';
    if (rand < 0.7) return 'good';
    return 'fair';
  }

  private calculateMockXP(duration: number, poseCount: number, quality: string): number {
    const baseXP = 50;
    const durationBonus = duration * 2;
    const poseBonus = poseCount * 10;
    
    const qualityMultiplier = quality === 'excellent' ? 2 : quality === 'good' ? 1.5 : 1;
    
    return Math.floor((baseXP + durationBonus + poseBonus) * qualityMultiplier);
  }

  // Tarih yardımcı fonksiyonları
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  }

  formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('tr-TR');
  }

  getWeekStart(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıç
    return new Date(d.setDate(diff));
  }

  getDaysInWeek(startDate: Date): Date[] {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Seviye hesaplama
  calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
  }

  calculateXPToNextLevel(xp: number): number {
    return 500 - (xp % 500);
  }

  // Kalite rengi döndür
  getQualityColor(quality: string): string {
    switch (quality) {
      case 'excellent': return '#4caf50'; // yeşil
      case 'good': return '#ff9800';      // turuncu
      case 'fair': return '#f44336';      // kırmızı
      default: return '#9e9e9e';          // gri
    }
  }

  // Motivation mesajları
  getMotivationMessage(streak: number): string {
    if (streak === 0) return 'Başlamak için harika bir gün! 🌟';
    if (streak === 1) return 'Başlangıç yaptın! Devam et! 💪';
    if (streak < 7) return `${streak} gün harika! Hedefe doğru ilerliyorsun! 🔥`;
    if (streak < 30) return `${streak} günlük seri muhteşem! Sen bir şampiyon! 🏆`;
    return `${streak} gün! Bu inanılmaz bir başarı! 🌟✨`;
  }
}

// Singleton instance
const streakService = new StreakService();
export default streakService; 