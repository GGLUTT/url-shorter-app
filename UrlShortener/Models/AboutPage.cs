namespace UrlShortener.Models
{
    public class AboutPage
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        public int ModifiedById { get; set; }
        public virtual User ModifiedBy { get; set; }
    }
}