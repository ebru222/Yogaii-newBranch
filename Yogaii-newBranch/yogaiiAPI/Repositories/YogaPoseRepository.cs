using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using YogaPoseApi.Models;
using Microsoft.Extensions.Options;

namespace YogaPoseApi.Repositories
{
    public class YogaPoseRepository
    {
        private readonly IMongoCollection<YogaPose> _posesCollection;

        public YogaPoseRepository(IOptions<DatabaseSettings> dbSettings)
        {
            var mongoClient = new MongoClient(dbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(dbSettings.Value.DatabaseName);
            _posesCollection = mongoDatabase.GetCollection<YogaPose>(dbSettings.Value.YogaPoseCollectionName);
        }

        public async Task<List<YogaPose>> GetAllAsync() =>
            await _posesCollection.Find(_ => true).ToListAsync();

        public async Task<YogaPose> GetByNameAsync(string name) =>
            await _posesCollection.Find(x => x.Name.ToLower() == name.ToLower()).FirstOrDefaultAsync();

        public async Task<YogaPose> GetByIdAsync(string id) =>
            await _posesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(YogaPose pose) =>
            await _posesCollection.InsertOneAsync(pose);

        public async Task UpdateAsync(string id, YogaPose pose) =>
            await _posesCollection.ReplaceOneAsync(x => x.Id == id, pose);

        public async Task RemoveAsync(string id) =>
            await _posesCollection.DeleteOneAsync(x => x.Id == id);
    }
}