using Microsoft.EntityFrameworkCore;
using UrlShortener.Models;

namespace UrlShortener.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<UrlMapping> UrlMappings { get; set; }
        public DbSet<AboutPage> AboutPages { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Конфиг юзера
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
            
            modelBuilder.Entity<UrlMapping>()
                .HasIndex(u => u.ShortCode)
                .IsUnique();
                
            modelBuilder.Entity<UrlMapping>()
                .HasIndex(u => u.OriginalUrl)
                .IsUnique();
                
            modelBuilder.Entity<UrlMapping>()
                .HasOne(u => u.CreatedBy)
                .WithMany(u => u.UrlMappings)
                .HasForeignKey(u => u.CreatedById)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<AboutPage>()
                .HasOne(a => a.ModifiedBy)
                .WithMany()
                .HasForeignKey(a => a.ModifiedById)
                .OnDelete(DeleteBehavior.Restrict);
                
            SeedData(modelBuilder);
        }
        
        private void SeedData(ModelBuilder modelBuilder)
        {
            // Создать админа
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Admin,
                    CreatedDate = DateTime.UtcNow
                }
            );
            
            modelBuilder.Entity<AboutPage>().HasData(
                new AboutPage
                {
                    Id = 1,
                    Content = "This URL Shortener uses a Base62 encoding algorithm to generate short codes. It converts the URL ID to a short alphanumeric string using characters [a-zA-Z0-9].",
                    LastModified = DateTime.UtcNow,
                    ModifiedById = 1
                }
            );
        }
    }
}