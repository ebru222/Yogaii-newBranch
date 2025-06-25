using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using YogaPoseApi.Models;
using YogaPoseApi.Services;
using YogaPoseApi.Repositories;

namespace YogaPoseApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class YogaPoseController : ControllerBase
    {
        private readonly ILogger<YogaPoseController> _logger;
        private readonly YogaPoseService _yogaPoseService;

        public YogaPoseController(ILogger<YogaPoseController> logger, YogaPoseService yogaPoseService)
        {
            _logger = logger;
            _yogaPoseService = yogaPoseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<YogaPose>>> GetAllPoses()
        {
            return await _yogaPoseService.GetAllPoses();
        }

        [HttpGet("{name}")]
        public async Task<ActionResult<YogaPose>> GetPoseByName(string name)
        {
            var pose = await _yogaPoseService.GetPoseByName(name);
            if (pose == null)
            {
                return NotFound($"Yoga pozu bulunamadı: {name}");
            }
            return pose;
        }

        [HttpPost("predict")]
        public async Task<ActionResult<YogaPosePrediction>> PredictPose([FromBody] ImageRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageBase64))
            {
                return BadRequest("Base64 formatında görüntü verisi gereklidir");
            }

            try
            {
                var prediction = await _yogaPoseService.PredictPoseFromBase64ImageAsync(request.ImageBase64);
                return prediction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yoga pozu tahmini sırasında hata oluştu");
                return StatusCode(500, "Görüntü işlenirken bir hata oluştu");
            }
        }
    }
}
