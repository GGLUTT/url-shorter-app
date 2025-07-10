using System.ComponentModel.DataAnnotations;

namespace UrlShortener.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        public UserRole Role { get; set; } = UserRole.User;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public virtual ICollection<UrlMapping> UrlMappings { get; set; } = new List<UrlMapping>();
    }
    
    public enum UserRole
    {
        User,
        Admin
    }
}