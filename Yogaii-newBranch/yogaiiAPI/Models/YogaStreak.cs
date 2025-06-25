using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace YogaPoseApi.Models
{
    public class YogaStreak
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int TotalDays { get; set; }
        public DateTime? LastPracticeDate { get; set; }
        public int WeeklyGoal { get; set; }
        public int WeeklyProgress { get; set; }
        public int Level { get; set; }
        public int XP { get; set; }
        public int XPToNextLevel { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class DailyActivity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        
        public DateTime Date { get; set; }
        public bool Practiced { get; set; }
        public int Duration { get; set; } // dakika cinsinden
        public List<string> Poses { get; set; } = new List<string>();
        public string Quality { get; set; } = "good"; // excellent, good, fair
        public int XPEarned { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Achievement
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string AchievementId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public int RequiredValue { get; set; }
        public string Type { get; set; } // streak, total_days, early_bird, etc.
        public DateTime CreatedAt { get; set; }
    }

    public class UserAchievement
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string AchievementId { get; set; }
        
        public bool IsUnlocked { get; set; }
        public DateTime? UnlockedDate { get; set; }
        public int Progress { get; set; }
        public int MaxProgress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 