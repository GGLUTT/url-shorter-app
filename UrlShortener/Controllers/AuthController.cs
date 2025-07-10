using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrlShortener.Services;
using UrlShortener.Data;

namespace UrlShortener.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ApplicationDbContext _context;
        
        public AuthController(IAuthService authService, ApplicationDbContext context)
        {
            _authService = authService;
            _context = context;
        }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.LoginAsync(request.Username, request.Password);
            
            if (token == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }
            
            return Ok(new { token, username = request.Username });
        }
        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _authService.RegisterAsync(request.Username, request.Password);
                return Ok(new { message = "User registered successfully", userId = user.Id });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        // Debug для проверки записів у бд
        [HttpGet("debug/users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new { 
                    u.Id, 
                    u.Username, 
                    u.Role, 
                    u.CreatedDate,
                    UrlCount = _context.UrlMappings.Count(url => url.CreatedById == u.Id)
                })
                .ToListAsync();
            
            return Ok(users);
        }

        [HttpGet("debug/urls")]
        public async Task<IActionResult> GetAllUrls()
        {
            var urls = await (from url in _context.UrlMappings
                             join user in _context.Users on url.CreatedById equals user.Id
                             select new {
                                 url.Id,
                                 url.OriginalUrl,
                                 url.ShortCode,
                                 url.CreatedDate,
                                 url.ClickCount,
                                 url.LastAccessed,
                                 Username = user.Username,
                                 UserRole = user.Role
                             }).ToListAsync();
            
            return Ok(urls);
        }
    }
    
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
    
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}