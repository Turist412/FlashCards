using FlashCards.Core.Enums;

namespace FlashCards.Core.Entities
{
    public class Card
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DeckId { get; set; }
        public Guid UserId { get; set; }
        public string FrontText { get; set; } //The world to learn
        public string BackText { get; set; } //The definition of the word
        public Deck Deck { get; set; }
        public Language Language { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int ReviewCount { get; set; } = 0;
        public DateTime? NextReviewDate { get; set; }
        public GrammaticalGender? Gender { get; set; }
        public string? Plural { get; set; } //Used for languages like German
        public string? Pronunciation { get; set; }
    }

}
