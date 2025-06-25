using Microsoft.AspNetCore.Mvc;
using YogaPoseApi.Models;
using YogaPoseApi.Repositories;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace YogaPoseApi.Controllers
{
    // Login için DTO
    public class LoginRequest
    {
        public string Username { get; set; }
        public string PasswordHash { get; set; }
    }

    // Register için DTO
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(UserRepository userRepository, IConfiguration configuration, ILogger<AuthenticationController> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                _logger.LogInformation("🔄 Register isteği alındı");
                _logger.LogInformation("📤 Username: {Username}", request?.Username);
                _logger.LogInformation("📤 Email: {Email}", request?.Email);
                _logger.LogInformation("📤 Password Length: {PasswordLength}", request?.PasswordHash?.Length);

                // Validation
                if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length < 3)
                {
                    _logger.LogWarning("❌ Username validation hatası: {Username}", request?.Username);
                    return BadRequest(new { message = "Kullanıcı adı en az 3 karakter olmalıdır." });
                }

                if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
                {
                    _logger.LogWarning("❌ Email validation hatası: {Email}", request?.Email);
                    return BadRequest(new { message = "Geçerli bir email adresi girin." });
                }

                if (string.IsNullOrWhiteSpace(request.PasswordHash) || request.PasswordHash.Length < 6)
                {
                    _logger.LogWarning("❌ Password validation hatası - Length: {Length}", request?.PasswordHash?.Length);
                    return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır." });
                }

                _logger.LogInformation("✅ Validation geçti, username kontrolü yapılıyor...");

                // Check if username already exists
                var existingUser = await _userRepository.GetUserByUsernameAsync(request.Username);
                if (existingUser != null)
                {
                    _logger.LogWarning("❌ Username zaten mevcut: {Username}", request.Username);
                    return BadRequest(new { message = "Bu kullanıcı adı zaten kullanımda." });
                }

                _logger.LogInformation("✅ Username mevcut değil, email kontrolü yapılıyor...");

                // Check if email already exists
                var existingEmail = await _userRepository.GetUserByEmailAsync(request.Email);
                if (existingEmail != null)
                {
                    _logger.LogWarning("❌ Email zaten mevcut: {Email}", request.Email);
                    return BadRequest(new { message = "Bu email adresi zaten kayıtlı." });
                }

                _logger.LogInformation("✅ Email mevcut değil, kullanıcı oluşturuluyor...");

                // Create user object
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash),
                    CreatedAt = DateTime.UtcNow
                };
                
                _logger.LogInformation("✅ User nesnesi oluşturuldu, veritabanına kaydediliyor...");
                
                await _userRepository.CreateUserAsync(user);
                
                _logger.LogInformation("✅ Kullanıcı başarıyla kaydedildi! UserId: {UserId}", user.Id);
                
                return Ok(new { 
                    message = "Kayıt başarılı! Hoş geldiniz!", 
                    success = true 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Register hatası - Username: {Username}, Email: {Email}", request?.Username, request?.Email);
                return StatusCode(500, new { message = "Sunucu hatası. Lütfen tekrar deneyin.", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            try
            {
                _logger.LogInformation("🔄 Login isteği alındı");
                _logger.LogInformation("📤 Username: {Username}", loginRequest?.Username);
                _logger.LogInformation("📤 Password Length: {PasswordLength}", loginRequest?.PasswordHash?.Length);

                // Validation
                if (string.IsNullOrWhiteSpace(loginRequest.Username))
                {
                    _logger.LogWarning("❌ Username boş");
                    return BadRequest(new { message = "Kullanıcı adı gereklidir." });
                }

                if (string.IsNullOrWhiteSpace(loginRequest.PasswordHash))
                {
                    _logger.LogWarning("❌ Password boş");
                    return BadRequest(new { message = "Şifre gereklidir." });
                }

                _logger.LogInformation("✅ Validation geçti, kullanıcı aranıyor...");

                // Find user and verify password
                var user = await _userRepository.GetUserByUsernameAsync(loginRequest.Username);
                if (user == null)
                {
                    _logger.LogWarning("❌ Kullanıcı bulunamadı: {Username}", loginRequest.Username);
                    return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });
                }

                _logger.LogInformation("✅ Kullanıcı bulundu: {UserId}, şifre kontrol ediliyor...", user.Id);

                if (!BCrypt.Net.BCrypt.Verify(loginRequest.PasswordHash, user.PasswordHash))
                {
                    _logger.LogWarning("❌ Şifre hatalı - Username: {Username}", loginRequest.Username);
                    return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });
                }

                _logger.LogInformation("✅ Şifre doğru, last login güncelleniyor...");

                // Update last login time
                user.LastLoginAt = DateTime.UtcNow;
                await _userRepository.UpdateUserAsync(user);

                _logger.LogInformation("✅ Last login güncellendi, token oluşturuluyor...");

                // Generate token
                var token = GenerateJwtToken(user);
                
                _logger.LogInformation("✅ Token oluşturuldu, response gönderiliyor... UserId: {UserId}", user.Id);
                
                return Ok(new { 
                    token = token,
                    user = new {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email
                    },
                    message = "Giriş başarılı! Hoş geldiniz!",
                    success = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Login hatası - Username: {Username}", loginRequest?.Username);
                return StatusCode(500, new { message = "Sunucu hatası. Lütfen tekrar deneyin.", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            try
            {
                _logger.LogInformation("🔄 JWT Token oluşturuluyor... UserId: {UserId}", user.Id);
                
                var jwtKey = _configuration.GetSection("JwtSettings:Secret").Value;
                
                if (string.IsNullOrEmpty(jwtKey))
                {
                    _logger.LogError("❌ JWT Secret bulunamadı!");
                    throw new InvalidOperationException("JWT Secret configuration bulunamadı.");
                }
                
                _logger.LogInformation("✅ JWT Secret bulundu");
                
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.Username)
                };

                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(7),
                    signingCredentials: creds);

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                
                _logger.LogInformation("✅ JWT Token başarıyla oluşturuldu! UserId: {UserId}", user.Id);
                
                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ JWT Token oluşturma hatası - UserId: {UserId}", user?.Id);
                throw;
            }
        }
    }
}
