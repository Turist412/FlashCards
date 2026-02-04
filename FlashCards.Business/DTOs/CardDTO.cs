using FlashCards.Core.Enums;

namespace FlashCards.Business.DTOs
{
    public class CardDTO
    {
        public Guid Id { get; set; }
        public Guid DeckId { get; set; }
        public string FrontText { get; set; }
        public string BackText { get; set; }
        public CardLanguage? Language { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ReviewCount { get; set; }
        public DateTime? NextReviewDate { get; set; }
        public GrammaticalGender? Gender { get; set; }
        public string? Plural { get; set; }
        public string? Pronunciation { get; set; }
    }
}
