using Microsoft.EntityFrameworkCore;
using UrlShortener.Data;
using UrlShortener.Models;

namespace UrlShortener.Services
{
    public class UrlShortenerService : IUrlShortenerService
    {
        private readonly ApplicationDbContext _context;
        private const string Characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        public UrlShortenerService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<string> ShortenUrlAsync(string originalUrl, int userId)
        {
            // Check if URL already exists
            var existingUrl = await _context.UrlMappings
                .FirstOrDefaultAsync(u => u.OriginalUrl == originalUrl);
                
            if (existingUrl != null)
            {
                throw new InvalidOperationException("URL already exists");
            }
            
            var shortCode = GenerateShortCode();
            
            // Ensure uniqueness
            while (await _context.UrlMappings.AnyAsync(u => u.ShortCode == shortCode))
            {
                shortCode = GenerateShortCode();
            }
            
            var urlMapping = new UrlMapping
            {
                OriginalUrl = originalUrl,
                ShortCode = shortCode,
                CreatedById = userId
            };
            
            _context.UrlMappings.Add(urlMapping);
            await _context.SaveChangesAsync();
            
            return shortCode;
        }
        
        public async Task<UrlMapping> GetUrlMappingAsync(string shortCode)
        {
            return await _context.UrlMappings
                .Include(u => u.CreatedBy)
                .FirstOrDefaultAsync(u => u.ShortCode == shortCode);
        }
        
        public async Task<IEnumerable<UrlMapping>> GetAllUrlMappingsAsync()
        {
            return await _context.UrlMappings
                .Include(u => u.CreatedBy)
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();
        }
        
        public async Task<UrlMapping> GetUrlMappingByIdAsync(int id)
        {
            return await _context.UrlMappings
                .Include(u => u.CreatedBy)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        
        public async Task<bool> DeleteUrlMappingAsync(int id, int userId, bool isAdmin)
        {
            var urlMapping = await _context.UrlMappings.FindAsync(id);
            
            if (urlMapping == null) return false;
            
            // Check permissions
            if (!isAdmin && urlMapping.CreatedById != userId)
            {
                return false;
            }
            
            _context.UrlMappings.Remove(urlMapping);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        public async Task IncrementClickCountAsync(string shortCode)
        {
            var urlMapping = await _context.UrlMappings
                .FirstOrDefaultAsync(u => u.ShortCode == shortCode);
                
            if (urlMapping != null)
            {
                urlMapping.ClickCount++;
                urlMapping.LastAccessed = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        
        public string GenerateShortCode()
        {
            var random = new Random();
            var shortCode = new char[6];
            
            for (int i = 0; i < shortCode.Length; i++)
            {
                shortCode[i] = Characters[random.Next(Characters.Length)];
            }
            
            return new string(shortCode);
        }
    }
}