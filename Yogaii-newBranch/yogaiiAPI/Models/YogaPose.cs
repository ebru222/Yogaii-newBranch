using System;
using System.Collections.Generic;
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

    public class YogaPosePrediction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public YogaPose PredictedPose { get; set; }
        public float Confidence { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, float> AllPredictions { get; set; }
    }

    public class ImageRequest
    {
        public string ImageBase64 { get; set; }
    }
    
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string YogaPoseCollectionName { get; set; } = null!;
        public string PredictionCollectionName { get; set; } = null!;
    }
}
