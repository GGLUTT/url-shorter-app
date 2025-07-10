using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrlShortener.Data;
using UrlShortener.Models;
using UrlShortener.Services;

namespace UrlShortener.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;
        
        public AboutController(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAboutContent()
        {
            var about = await _context.AboutPages
                .Include(a => a.ModifiedBy)
                .FirstOrDefaultAsync();
                
            if (about == null)
            {
                return NotFound();
            }
            
            return Ok(new
            {
                about.Id,
                about.Content,
                about.LastModified,
                ModifiedBy = about.ModifiedBy.Username
            });
        }
        
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateAboutContent([FromBody] UpdateAboutRequest request)
        {
            var userId = _authService.GetCurrentUserId();
            var isAdmin = _authService.IsCurrentUserAdmin();
            
            if (userId == null || !isAdmin)
            {
                return Forbid();
            }
            
            var about = await _context.AboutPages.FirstOrDefaultAsync();
            
            if (about == null)
            {
                about = new AboutPage
                {
                    Content = request.Content,
                    ModifiedById = userId.Value,
                    LastModified = DateTime.UtcNow
                };
                _context.AboutPages.Add(about);
            }
            else
            {
                about.Content = request.Content;
                about.ModifiedById = userId.Value;
                about.LastModified = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "About page updated successfully" });
        }
    }
    
    public class UpdateAboutRequest
    {
        public string Content { get; set; }
    }
}