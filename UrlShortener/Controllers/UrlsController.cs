using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrlShortener.Services;

namespace UrlShortener.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UrlsController : ControllerBase
    {
        private readonly IUrlShortenerService _urlService;
        private readonly IAuthService _authService;
        
        public UrlsController(IUrlShortenerService urlService, IAuthService authService)
        {
            _urlService = urlService;
            _authService = authService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAllUrls()
        {
            var urls = await _urlService.GetAllUrlMappingsAsync();
            var result = urls.Select(u => new
            {
                u.Id,
                u.OriginalUrl,
                u.ShortCode,
                u.CreatedDate,
                u.ClickCount,
                u.LastAccessed,
                CreatedBy = u.CreatedBy.Username,
                CreatedById = u.CreatedBy.Id
            });
            
            return Ok(result);
        }
        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUrlById(int id)
        {
            var url = await _urlService.GetUrlMappingByIdAsync(id);
            
            if (url == null)
            {
                return NotFound();
            }
            
            var result = new
            {
                url.Id,
                url.OriginalUrl,
                url.ShortCode,
                url.CreatedDate,
                url.ClickCount,
                url.LastAccessed,
                CreatedBy = url.CreatedBy.Username,
                CreatedById = url.CreatedBy.Id
            };
            
            return Ok(result);
        }
        
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateShortUrl([FromBody] CreateUrlRequest request)
        {
            var userId = _authService.GetCurrentUserId();
            
            if (userId == null)
            {
                return Unauthorized();
            }
            
            try
            {
                var shortCode = await _urlService.ShortenUrlAsync(request.OriginalUrl, userId.Value);
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                
                return Ok(new 
                { 
                    shortCode, 
                    shortUrl = $"{baseUrl}/{shortCode}",
                    originalUrl = request.OriginalUrl
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUrl(int id)
        {
            var userId = _authService.GetCurrentUserId();
            var isAdmin = _authService.IsCurrentUserAdmin();
            
            if (userId == null)
            {
                return Unauthorized();
            }
            
            var success = await _urlService.DeleteUrlMappingAsync(id, userId.Value, isAdmin);
            
            if (!success)
            {
                return NotFound();
            }
            
            return Ok(new { message = "URL deleted successfully" });
        }
    }
    
    public class CreateUrlRequest
    {
        public string OriginalUrl { get; set; }
    }
}