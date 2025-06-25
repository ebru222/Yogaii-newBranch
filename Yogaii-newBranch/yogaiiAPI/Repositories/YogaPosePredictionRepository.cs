using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using YogaPoseApi.Models;
using Microsoft.Extensions.Options;
using System;

namespace YogaPoseApi.Repositories
{
    public class YogaPosePredictionRepository
    {
        private readonly IMongoCollection<YogaPosePrediction> _predictionsCollection;

        public YogaPosePredictionRepository(IOptions<DatabaseSettings> dbSettings)
        {
            var mongoClient = new MongoClient(dbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(dbSettings.Value.DatabaseName);
            _predictionsCollection = mongoDatabase.GetCollection<YogaPosePrediction>(dbSettings.Value.PredictionCollectionName);
        }

        public async Task<List<YogaPosePrediction>> GetAllAsync() =>
            await _predictionsCollection.Find(_ => true).ToListAsync();

        public async Task<YogaPosePrediction> GetByIdAsync(string id) =>
            await _predictionsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<YogaPosePrediction>> GetRecentPredictionsAsync(int limit = 10) =>
            await _predictionsCollection.Find(_ => true)
                .SortByDescending(p => p.Timestamp)
                .Limit(limit)
                .ToListAsync();

        public async Task CreateAsync(YogaPosePrediction prediction) =>
            await _predictionsCollection.InsertOneAsync(prediction);

        public async Task UpdateAsync(string id, YogaPosePrediction prediction) =>
            await _predictionsCollection.ReplaceOneAsync(x => x.Id == id, prediction);

        public async Task RemoveAsync(string id) =>
            await _predictionsCollection.DeleteOneAsync(x => x.Id == id);
    }
}