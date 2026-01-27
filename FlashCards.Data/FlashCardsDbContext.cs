using FlashCards.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Data
{
    public class FlashCardsDbContext : DbContext
    {
        public FlashCardsDbContext(DbContextOptions<FlashCardsDbContext> options) : base(options)
        {
        }
        public DbSet<Card> Cards { get; set; }
        public DbSet<Deck> Decks { get; set; }

        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

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
        }
    }
}
