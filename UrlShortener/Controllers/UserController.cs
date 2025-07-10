using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrlShortener.Services;

namespace UrlShortener.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;
        
        public UserController(IAuthService authService)
        {
            _authService = authService;
        }
        
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _authService.GetCurrentUserId();
            
            if (userId == null)
            {
                return Unauthorized();
            }
            
            var user = await _authService.GetUserByIdAsync(userId.Value);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role,
                user.CreatedDate,
                IsAdmin = user.Role == UrlShortener.Models.UserRole.Admin
            });
        }
    }
}