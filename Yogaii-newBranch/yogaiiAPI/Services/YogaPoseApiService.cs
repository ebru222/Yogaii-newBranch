using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using YogaPoseApi.Models;

namespace YogaPoseApi.Services
{
    public class YogaPoseApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;

        public YogaPoseApiService(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiBaseUrl = "http://192.168.1.45:5000"; // Python API adresi
        }

        public async Task<bool> IsApiHealthy()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_apiBaseUrl}/api/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<YogaPosePrediction> PredictPoseAsync(string base64Image)
        {
            try
            {
                var requestData = new { image = base64Image };
                var content = new StringContent(
                    JsonSerializer.Serialize(requestData),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync($"{_apiBaseUrl}/api/predict", content);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var prediction = JsonSerializer.Deserialize<YogaPosePrediction>(
                    jsonResponse,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return prediction;
            }
            catch (Exception ex)
            {
                // Gerçek uygulamada loglama yapılabilir
                Console.WriteLine($"API isteği sırasında hata: {ex.Message}");
                throw;
            }
        }
    }
}