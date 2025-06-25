# MongoDB Entegrasyon Planı - YogaiiAPI

## 1. Gerekli Paketlerin Eklenmesi

```xml
<PackageReference Include="MongoDB.Driver" Version="2.24.0" />
```

## 2. MongoDB Bağlantı Ayarları

`appsettings.json` dosyasına eklenecek yapılandırma:

```json
"MongoDB": {
  "ConnectionString": "mongodb://localhost:27017",
  "DatabaseName": "YogaiiDB",
  "PosesCollectionName": "Poses",
  "UsersCollectionName": "Users",
  "SessionsCollectionName": "Sessions"
}
```

## 3. Model Sınıflarının MongoDB'ye Uyarlanması

### YogaPose.cs Güncellemesi

```csharp
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace YogaPoseApi.Models
{
    public class YogaPose
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string ModelUrl { get; set; }
        public float Confidence { get; set; }
    }
}
```

### Yeni Model Sınıfları

```csharp
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace YogaPoseApi.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class YogaSession
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<YogaPosePrediction> Predictions { get; set; }
        public int TotalDuration { get; set; } // Saniye cinsinden
    }
}
```

## 4. MongoDB Repository Sınıfları

```csharp
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using YogaPoseApi.Models;
using Microsoft.Extensions.Options;

namespace YogaPoseApi.Repositories
{
    public class MongoDBSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
        public string PosesCollectionName { get; set; }
        public string UsersCollectionName { get; set; }
        public string SessionsCollectionName { get; set; }
    }

    public class YogaPoseRepository
    {
        private readonly IMongoCollection<YogaPose> _posesCollection;

        public YogaPoseRepository(IOptions<MongoDBSettings> mongoDBSettings)
        {
            var mongoClient = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _posesCollection = mongoDatabase.GetCollection<YogaPose>(mongoDBSettings.Value.PosesCollectionName);
        }

        public async Task<List<YogaPose>> GetAllAsync() =>
            await _posesCollection.Find(_ => true).ToListAsync();

        public async Task<YogaPose> GetByNameAsync(string name) =>
            await _posesCollection.Find(x => x.Name.ToLower() == name.ToLower()).FirstOrDefaultAsync();

        public async Task CreateAsync(YogaPose pose) =>
            await _posesCollection.InsertOneAsync(pose);

        public async Task UpdateAsync(string id, YogaPose pose) =>
            await _posesCollection.ReplaceOneAsync(x => x.Id == id, pose);

        public async Task RemoveAsync(string id) =>
            await _posesCollection.DeleteOneAsync(x => x.Id == id);
    }

    public class UserRepository
    {
        private readonly IMongoCollection<User> _usersCollection;

        public UserRepository(IOptions<MongoDBSettings> mongoDBSettings)
        {
            var mongoClient = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(mongoDBSettings.Value.UsersCollectionName);
        }

        public async Task<List<User>> GetAllAsync() =>
            await _usersCollection.Find(_ => true).ToListAsync();

        public async Task<User> GetByIdAsync(string id) =>
            await _usersCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<User> GetByEmailAsync(string email) =>
            await _usersCollection.Find(x => x.Email == email).FirstOrDefaultAsync();

        public async Task CreateAsync(User user) =>
            await _usersCollection.InsertOneAsync(user);

        public async Task UpdateAsync(string id, User user) =>
            await _usersCollection.ReplaceOneAsync(x => x.Id == id, user);

        public async Task RemoveAsync(string id) =>
            await _usersCollection.DeleteOneAsync(x => x.Id == id);
    }

    public class YogaSessionRepository
    {
        private readonly IMongoCollection<YogaSession> _sessionsCollection;

        public YogaSessionRepository(IOptions<MongoDBSettings> mongoDBSettings)
        {
            var mongoClient = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
            _sessionsCollection = mongoDatabase.GetCollection<YogaSession>(mongoDBSettings.Value.SessionsCollectionName);
        }

        public async Task<List<YogaSession>> GetAllAsync() =>
            await _sessionsCollection.Find(_ => true).ToListAsync();

        public async Task<List<YogaSession>> GetByUserIdAsync(string userId) =>
            await _sessionsCollection.Find(x => x.UserId == userId).ToListAsync();

        public async Task<YogaSession> GetByIdAsync(string id) =>
            await _sessionsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(YogaSession session) =>
            await _sessionsCollection.InsertOneAsync(session);

        public async Task UpdateAsync(string id, YogaSession session) =>
            await _sessionsCollection.ReplaceOneAsync(x => x.Id == id, session);

        public async Task RemoveAsync(string id) =>
            await _sessionsCollection.DeleteOneAsync(x => x.Id == id);
    }
}
```

## 5. Program.cs Güncellemesi

```csharp
// MongoDB yapılandırması
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<YogaPoseRepository>();
builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<YogaSessionRepository>();
```

## 6. YogaPoseService Güncellemesi

Mevcut YogaPoseService sınıfı, verileri hardcoded dictionary yerine MongoDB'den alacak şekilde güncellenecektir.

## 7. Kurulum Adımları

1. MongoDB'yi yerel makinede veya bulutta kurma
2. MongoDB.Driver paketini projeye ekleme
3. appsettings.json dosyasını güncelleme
4. Model sınıflarını güncelleme
5. Repository sınıflarını ekleme
6. Program.cs dosyasını güncelleme
7. Servisleri repository'leri kullanacak şekilde güncelleme

## 8. Veri Taşıma

Mevcut hardcoded veriler MongoDB'ye aktarılacaktır. Bu işlem için bir veri taşıma scripti veya bir seeder sınıfı oluşturulabilir.