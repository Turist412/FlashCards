using FlashCards.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Data
{
    public class FlashCardsDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public FlashCardsDbContext(DbContextOptions<FlashCardsDbContext> options) : base(options)
        {
        }
        public DbSet<Card> Cards { get; set; }
        public DbSet<Deck> Decks { get; set; }
        public DbSet<DictionaryWord> DictionaryWords { get; set; }

        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

            mb.Entity<User>(entity =>
            {
                entity.HasMany(u => u.Cards)
                    .WithOne()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Decks)
                    .WithOne()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            mb.Entity<Card>(entity =>
            {
                entity.Property(e => e.FrontText)
                .IsRequired()
                .HasMaxLength(200);

                entity.Property(e => e.BackText)
                .IsRequired()
                .HasMaxLength(200);

                entity.HasIndex(e => e.FrontText);

                entity.HasOne(c => c.Deck)
                .WithMany(d => d.Cards)
                .HasForeignKey(c => c.DeckId)
                .OnDelete(DeleteBehavior.NoAction);
            });

            mb.Entity<Deck>(entity =>
            {
                entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            });

            mb.Entity<DictionaryWord>(entity =>
            {
                entity.Property(e => e.Text)
                .IsRequired()
                .HasMaxLength(100);
            });
        }
    }
}
