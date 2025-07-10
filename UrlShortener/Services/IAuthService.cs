using UrlShortener.Models;

namespace UrlShortener.Services
{
    public interface IAuthService
    {
        Task<string> LoginAsync(string username, string password);
        Task<User> GetUserByIdAsync(int id);
        Task<User> RegisterAsync(string username, string password, UserRole role = UserRole.User);
        int? GetCurrentUserId();
        bool IsCurrentUserAdmin();
    }
}