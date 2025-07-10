using UrlShortener.Models;

namespace UrlShortener.Services
{
    public interface IUrlShortenerService
    {
        Task<string> ShortenUrlAsync(string originalUrl, int userId);
        Task<UrlMapping> GetUrlMappingAsync(string shortCode);
        Task<IEnumerable<UrlMapping>> GetAllUrlMappingsAsync();
        Task<UrlMapping> GetUrlMappingByIdAsync(int id);
        Task<bool> DeleteUrlMappingAsync(int id, int userId, bool isAdmin);
        Task IncrementClickCountAsync(string shortCode);
        string GenerateShortCode();
    }
}