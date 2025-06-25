using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using YogaPoseApi.Models;
using YogaPoseApi.Services;

namespace YogaPoseApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class YogaPoseApiController : ControllerBase
    {
        private readonly YogaPoseApiService _yogaPoseApiService;

        public YogaPoseApiController(YogaPoseApiService yogaPoseApiService)
        {
            _yogaPoseApiService = yogaPoseApiService;
        }

        [HttpGet("health")]
        public async Task<IActionResult> CheckHealth()
        {
            var isHealthy = await _yogaPoseApiService.IsApiHealthy();
            if (isHealthy)
            {
                return Ok(new { status = "ok", message = "Python API bağlantısı sağlandı" });
            }
            return StatusCode(503, new { status = "error", message = "Python API bağlantısı kurulamadı" });
        }

        [HttpPost("predict")]
        public async Task<IActionResult> PredictPose([FromBody] PoseImageRequest request)
        {
            if (string.IsNullOrEmpty(request?.ImageBase64))
            {
                return BadRequest(new { error = "Görüntü verisi bulunamadı" });
            }

            try
            {
                var prediction = await _yogaPoseApiService.PredictPoseAsync(request.ImageBase64);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Tahmin yapılırken hata oluştu: {ex.Message}" });
            }
        }
    }

    public class PoseImageRequest
    {
        public string ImageBase64 { get; set; }
    }
}