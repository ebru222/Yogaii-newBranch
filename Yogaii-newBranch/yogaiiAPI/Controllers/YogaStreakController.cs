using Microsoft.AspNetCore.Mvc;
using YogaPoseApi.Models;
using YogaPoseApi.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace YogaPoseApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class YogaStreakController : ControllerBase
    {
        private readonly YogaStreakRepository _streakRepository;
        private readonly ILogger<YogaStreakController> _logger;

        public YogaStreakController(YogaStreakRepository streakRepository, ILogger<YogaStreakController> logger)
        {
            _streakRepository = streakRepository;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserStreak(string userId)
        {
            try
            {
                _logger.LogInformation("🔄 GetUserStreak isteği alındı - UserId: {UserId}", userId);

                var streak = await _streakRepository.GetUserStreakAsync(userId);
                
                if (streak == null)
                {
                    _logger.LogInformation("✅ Kullanıcı için streak bulunamadı, yeni streak oluşturuluyor - UserId: {UserId}", userId);
                    
                    // İlk defa streak oluştur
                    streak = new YogaStreak
                    {
                        UserId = userId,
                        CurrentStreak = 0,
                        LongestStreak = 0,
                        TotalDays = 0,
                        LastPracticeDate = null,
                        WeeklyGoal = 5,
                        WeeklyProgress = 0,
                        Level = 1,
                        XP = 0,
                        XPToNextLevel = 100,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _streakRepository.CreateStreakAsync(streak);
                }

                _logger.LogInformation("✅ Streak başarıyla getirildi - UserId: {UserId}, CurrentStreak: {CurrentStreak}", userId, streak.CurrentStreak);

                return Ok(streak);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetUserStreak hatası - UserId: {UserId}", userId);
                return StatusCode(500, new { message = "Streak verileri alınırken hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("activities/{userId}/week")]
        public async Task<IActionResult> GetWeeklyActivities(string userId)
        {
            try
            {
                _logger.LogInformation("🔄 GetWeeklyActivities isteği alındı - UserId: {UserId}", userId);

                var startOfWeek = GetStartOfWeek(DateTime.UtcNow);
                var activities = await _streakRepository.GetUserActivitiesAsync(userId, startOfWeek, startOfWeek.AddDays(7));

                _logger.LogInformation("✅ Haftalık aktiviteler başarıyla getirildi - UserId: {UserId}, Count: {Count}", userId, activities.Count);

                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetWeeklyActivities hatası - UserId: {UserId}", userId);
                return StatusCode(500, new { message = "Haftalık aktiviteler alınırken hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("achievements/{userId}")]
        public async Task<IActionResult> GetUserAchievements(string userId)
        {
            try
            {
                _logger.LogInformation("🔄 GetUserAchievements isteği alındı - UserId: {UserId}", userId);

                var achievements = await _streakRepository.GetUserAchievementsAsync(userId);

                _logger.LogInformation("✅ Başarımlar başarıyla getirildi - UserId: {UserId}, Count: {Count}", userId, achievements.Count);

                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetUserAchievements hatası - UserId: {UserId}", userId);
                return StatusCode(500, new { message = "Başarımlar alınırken hata oluştu.", error = ex.Message });
            }
        }

        [HttpPost("activity")]
        public async Task<IActionResult> AddDailyActivity([FromBody] DailyActivity activity)
        {
            try
            {
                _logger.LogInformation("🔄 AddDailyActivity isteği alındı - UserId: {UserId}", activity.UserId);

                activity.XPEarned = CalculateXP(activity.Duration, activity.Poses?.Count ?? 0, activity.Quality);
                activity.CreatedAt = DateTime.UtcNow;

                await _streakRepository.CreateActivityAsync(activity);

                // Streak güncelle
                await UpdateUserStreak(activity.UserId, activity.Date, activity.XPEarned);

                _logger.LogInformation("✅ Aktivite başarıyla eklendi - UserId: {UserId}, XP: {XP}", activity.UserId, activity.XPEarned);

                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ AddDailyActivity hatası - UserId: {UserId}", activity?.UserId);
                return StatusCode(500, new { message = "Aktivite eklenirken hata oluştu.", error = ex.Message });
            }
        }

        private async Task UpdateUserStreak(string userId, DateTime activityDate, int xpEarned)
        {
            var streak = await _streakRepository.GetUserStreakAsync(userId);
            if (streak == null) return;

            // XP ve level güncelle
            streak.XP += xpEarned;
            streak.TotalDays++;

            // Level hesapla
            var newLevel = CalculateLevel(streak.XP);
            if (newLevel > streak.Level)
            {
                streak.Level = newLevel;
                _logger.LogInformation("🎉 Level atladı! UserId: {UserId}, NewLevel: {Level}", userId, newLevel);
            }

            streak.XPToNextLevel = CalculateXPToNextLevel(streak.XP);

            // Streak hesapla
            if (streak.LastPracticeDate.HasValue)
            {
                var daysDiff = (activityDate.Date - streak.LastPracticeDate.Value.Date).Days;
                if (daysDiff == 1)
                {
                    streak.CurrentStreak++;
                }
                else if (daysDiff > 1)
                {
                    streak.CurrentStreak = 1; // Streak bozulmuş, yeniden başla
                }
                // daysDiff == 0 ise aynı gün, streak değişmez
            }
            else
            {
                streak.CurrentStreak = 1; // İlk aktivite
            }

            // En uzun streak güncelle
            if (streak.CurrentStreak > streak.LongestStreak)
            {
                streak.LongestStreak = streak.CurrentStreak;
            }

            streak.LastPracticeDate = activityDate;
            streak.UpdatedAt = DateTime.UtcNow;

            await _streakRepository.UpdateStreakAsync(streak);
        }

        private int CalculateXP(int duration, int poseCount, string quality)
        {
            int baseXP = duration * 2; // 2 XP per minute
            int poseBonus = poseCount * 5; // 5 XP per pose

            float qualityMultiplier = quality switch
            {
                "excellent" => 1.5f,
                "good" => 1.2f,
                "fair" => 1.0f,
                _ => 1.0f
            };

            return (int)((baseXP + poseBonus) * qualityMultiplier);
        }

        private int CalculateLevel(int xp)
        {
            return (xp / 100) + 1; // Her 100 XP'de bir level
        }

        private int CalculateXPToNextLevel(int xp)
        {
            int currentLevel = CalculateLevel(xp);
            int xpForNextLevel = currentLevel * 100;
            return xpForNextLevel - xp;
        }

        private DateTime GetStartOfWeek(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }
    }
} 