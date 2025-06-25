using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using YogaPoseApi.Models;
using YogaPoseApi.Repositories;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace YogaPoseApi.Services
{
    public class YogaPoseService
    {
        private readonly ILogger<YogaPoseService> _logger;
        private static readonly string[] PoseClasses = new[] { "downdog", "goddess", "plank", "tree", "warrior2" };
        private readonly YogaPoseRepository _poseRepository;
        private readonly YogaPosePredictionRepository _predictionRepository;

        public YogaPoseService(ILogger<YogaPoseService> logger, YogaPoseRepository poseRepository, YogaPosePredictionRepository predictionRepository)
        {
            _logger = logger;
            _poseRepository = poseRepository;
            _predictionRepository = predictionRepository;
            
            // Veritabanında yoga pozları yoksa, başlangıç verilerini ekle
            InitializeDatabase().Wait();
        }

        private async Task InitializeDatabase()
        {
            // Veritabanında yoga pozları var mı kontrol et
            var poses = await _poseRepository.GetAllAsync();
            if (poses.Count == 0)
            {
                // Yoga pozlarını ekle
                await _poseRepository.CreateAsync(new YogaPose
                {
                    Name = "Down Dog",
                    Description = "Aşağı Bakan Köpek (Down Dog) pozu, sırtı ve bacaların arkasını esnetir ve kol, omuz ve hamstringleri güçlendirir.",
                    ImageUrl = "/images/poses/downdog.jpg",
                    ModelUrl = "/models/poses/downdog.glb"
                });
                
                await _poseRepository.CreateAsync(new YogaPose
                {
                    Name = "Goddess",
                    Description = "Tanrıça (Goddess) pozu, kalçaları açar, bacakları ve çekirdek gücü güçlendirir.",
                    ImageUrl = "/images/poses/goddess.jpg",
                    ModelUrl = "/models/poses/goddess.glb"
                });
                
                await _poseRepository.CreateAsync(new YogaPose
                {
                    Name = "Plank",
                    Description = "Plank pozu, karın kaslarını, kolları ve bilekleri güçlendirir ve duruşu iyileştirir.",
                    ImageUrl = "/images/poses/plank.jpg",
                    ModelUrl = "/models/poses/plank.glb"
                });
                
                await _poseRepository.CreateAsync(new YogaPose
                {
                    Name = "Tree",
                    Description = "Ağaç (Tree) pozu, denge, konsantrasyon ve duruşu geliştirir.",
                    ImageUrl = "/images/poses/tree.jpg",
                    ModelUrl = "/models/poses/tree.glb"
                });
                
                await _poseRepository.CreateAsync(new YogaPose
                {
                    Name = "Warrior 2",
                    Description = "Savaşçı 2 (Warrior 2) pozu, bacakları güçlendirir, göğsü açar ve dayanıklılığı artırır.",
                    ImageUrl = "/images/poses/warrior2.jpg",
                    ModelUrl = "/models/poses/warrior2.glb"
                });
            }
        }

        public async Task<List<YogaPose>> GetAllPoses()
        {
            return await _poseRepository.GetAllAsync();
        }

        public async Task<YogaPose> GetPoseByName(string name)
        {
            return await _poseRepository.GetByNameAsync(name);
        }

        public async Task<YogaPosePrediction> PredictPoseFromBase64ImageAsync(string base64Image)
        {
            try
            {
                _logger.LogInformation("Görüntüden yoga pozu tahmin ediliyor...");

                // Python modelinin çağrılması simülasyonu (gerçek projede ML.NET veya TensorFlow.NET kullanılır)
                // Gerçek uygulamada, burada TensorFlow.NET ile modeliniz yüklenir ve tahmin yapılır
                
                // Simüle edilmiş tahmin sonuçları
                var random = new Random();
                var classIndex = random.Next(0, PoseClasses.Length);
                var poseName = PoseClasses[classIndex];
                
                // Tüm sınıflar için rastgele olasılıklar oluştur (toplamları 1'e eşit olacak)
                var allPredictions = new Dictionary<string, float>();
                float sum = 0;
                
                foreach (var className in PoseClasses)
                {
                    var value = (float)random.NextDouble();
                    allPredictions[className] = value;
                    sum += value;
                }
                
                // Normalize et (toplamları 1 yap)
                foreach (var key in allPredictions.Keys.ToList())
                {
                    allPredictions[key] /= sum;
                }
                
                // En yüksek olasılığa sahip pozu al
                var bestClass = allPredictions.OrderByDescending(x => x.Value).First();
                poseName = bestClass.Key;
                var confidence = bestClass.Value;

                // Tahmin edilen pozu veritabanından al
                var predictedPose = await GetPoseByName(poseName);
                
                // Tahmin sonucunu oluştur
                var prediction = new YogaPosePrediction
                {
                    PredictedPose = predictedPose,
                    Confidence = confidence,
                    Timestamp = DateTime.UtcNow,
                    AllPredictions = allPredictions
                };
                
                // Tahmin sonucunu veritabanına kaydet
                await _predictionRepository.CreateAsync(prediction);
                
                return prediction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yoga pozu tahmin edilirken bir hata oluştu");
                throw;
            }
        }

        // NOT: Gerçek uygulamada TensorFlow.NET kullanarak modeli yükleyip tahmin yapan bir metod buraya eklenmelidir
        // Bu örnek simule edilmiştir. Gerçek bir uygulamada aşağıdaki kütüphaneler kullanılabilir:
        // - TensorFlow.NET
        // - ML.NET
        // - Python interop via process calls
    }
}
