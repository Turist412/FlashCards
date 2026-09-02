using Microsoft.AspNetCore.Identity;

namespace FlashCards.Core.Entities
{
    public class User : IdentityUser<Guid>
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Deck> Decks { get; set; } = new List<Deck>();
        public ICollection<Card> Cards { get; set; } = new List<Card>();
    }
}
