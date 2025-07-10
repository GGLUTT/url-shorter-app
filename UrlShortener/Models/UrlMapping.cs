using System.ComponentModel.DataAnnotations;

namespace UrlShortener.Models
{
    public class UrlMapping
    {
        public int Id { get; set; }
        
        [Required]
        [Url]
        public string OriginalUrl { get; set; }
        
        [Required]
        [StringLength(10)]
        public string ShortCode { get; set; }
        
        public int CreatedById { get; set; }
        public virtual User CreatedBy { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public int ClickCount { get; set; } = 0;
        
        public DateTime? LastAccessed { get; set; }
        
    }
}