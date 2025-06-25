using MongoDB.Driver;
using YogaPoseApi.Models;
using Microsoft.Extensions.Configuration;

namespace YogaPoseApi.Repositories
{
    public class YogaStreakRepository
    {
        private readonly IMongoCollection<YogaStreak> _streaksCollection;
        private readonly IMongoCollection<DailyActivity> _activitiesCollection;
        private readonly IMongoCollection<Achievement> _achievementsCollection;
        private readonly IMongoCollection<UserAchievement> _userAchievementsCollection;

        public YogaStreakRepository(IConfiguration configuration)
        {
            var connectionString = configuration.GetSection("DatabaseSettings:ConnectionString").Value;
            var databaseName = configuration.GetSection("DatabaseSettings:DatabaseName").Value;

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            
            _streaksCollection = database.GetCollection<YogaStreak>("YogaStreaks");
            _activitiesCollection = database.GetCollection<DailyActivity>("DailyActivities");
            _achievementsCollection = database.GetCollection<Achievement>("Achievements");
            _userAchievementsCollection = database.GetCollection<UserAchievement>("UserAchievements");
        }

        // Yoga Streak işlemleri
        public async Task<YogaStreak?> GetUserStreakAsync(string userId)
        {
            return await _streaksCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task<YogaStreak> CreateStreakAsync(YogaStreak streak)
        {
            streak.CreatedAt = DateTime.UtcNow;
            streak.UpdatedAt = DateTime.UtcNow;
            await _streaksCollection.InsertOneAsync(streak);
            return streak;
        }

        public async Task<YogaStreak> UpdateStreakAsync(YogaStreak streak)
        {
            streak.UpdatedAt = DateTime.UtcNow;
            await _streaksCollection.ReplaceOneAsync(x => x.Id == streak.Id, streak);
            return streak;
        }

        // Daily Activity işlemleri
        public async Task<List<DailyActivity>> GetUserActivitiesAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var filter = Builders<DailyActivity>.Filter.Eq(x => x.UserId, userId);
            
            if (fromDate.HasValue)
                filter = Builders<DailyActivity>.Filter.And(filter, 
                    Builders<DailyActivity>.Filter.Gte(x => x.Date, fromDate.Value));
            
            if (toDate.HasValue)
                filter = Builders<DailyActivity>.Filter.And(filter, 
                    Builders<DailyActivity>.Filter.Lte(x => x.Date, toDate.Value));

            return await _activitiesCollection.Find(filter)
                .SortByDescending(x => x.Date)
                .ToListAsync();
        }

        public async Task<DailyActivity?> GetActivityByUserAndDateAsync(string userId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);
            
            return await _activitiesCollection.Find(x => 
                x.UserId == userId && 
                x.Date >= startOfDay && 
                x.Date < endOfDay
            ).FirstOrDefaultAsync();
        }

        public async Task<DailyActivity> CreateActivityAsync(DailyActivity activity)
        {
            activity.CreatedAt = DateTime.UtcNow;
            await _activitiesCollection.InsertOneAsync(activity);
            return activity;
        }

        public async Task<DailyActivity> UpdateActivityAsync(DailyActivity activity)
        {
            await _activitiesCollection.ReplaceOneAsync(x => x.Id == activity.Id, activity);
            return activity;
        }

        // Achievement işlemleri
        public async Task<List<Achievement>> GetAllAchievementsAsync()
        {
            return await _achievementsCollection.Find(_ => true).ToListAsync();
        }

        public async Task<List<UserAchievement>> GetUserAchievementsAsync(string userId)
        {
            return await _userAchievementsCollection.Find(x => x.UserId == userId).ToListAsync();
        }

        public async Task<UserAchievement> CreateUserAchievementAsync(UserAchievement userAchievement)
        {
            userAchievement.CreatedAt = DateTime.UtcNow;
            userAchievement.UpdatedAt = DateTime.UtcNow;
            await _userAchievementsCollection.InsertOneAsync(userAchievement);
            return userAchievement;
        }

        public async Task<UserAchievement> UpdateUserAchievementAsync(UserAchievement userAchievement)
        {
            userAchievement.UpdatedAt = DateTime.UtcNow;
            await _userAchievementsCollection.ReplaceOneAsync(x => x.Id == userAchievement.Id, userAchievement);
            return userAchievement;
        }

        // Haftalık istatistikler
        public async Task<int> GetWeeklyProgressAsync(string userId, DateTime startOfWeek)
        {
            var endOfWeek = startOfWeek.AddDays(7);
            var filter = Builders<DailyActivity>.Filter.And(
                Builders<DailyActivity>.Filter.Eq(x => x.UserId, userId),
                Builders<DailyActivity>.Filter.Gte(x => x.Date, startOfWeek),
                Builders<DailyActivity>.Filter.Lt(x => x.Date, endOfWeek),
                Builders<DailyActivity>.Filter.Eq(x => x.Practiced, true)
            );

            return (int)await _activitiesCollection.CountDocumentsAsync(filter);
        }

        // Streak hesaplama
        public async Task<int> CalculateCurrentStreakAsync(string userId)
        {
            var activities = await GetUserActivitiesAsync(userId);
            var practiceActivities = activities.Where(x => x.Practiced).OrderByDescending(x => x.Date).ToList();

            if (!practiceActivities.Any()) return 0;

            int streak = 0;
            var currentDate = DateTime.Today;

            // Eğer son pratik bugün veya dün yapılmışsa streak devam ediyor
            if (practiceActivities.First().Date.Date == currentDate || 
                practiceActivities.First().Date.Date == currentDate.AddDays(-1))
            {
                foreach (var activity in practiceActivities)
                {
                    if (activity.Date.Date == currentDate.AddDays(-streak))
                    {
                        streak++;
                    }
                    else if (activity.Date.Date < currentDate.AddDays(-streak))
                    {
                        break;
                    }
                }
            }

            return streak;
        }
    }
} 