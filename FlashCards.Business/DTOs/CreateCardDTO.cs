using FlashCards.Core.Enums;

namespace FlashCards.Business.DTOs
{
    public class CreateCardDTO
    {
        public string FrontText { get; set; }
        public string BackText { get; set; }
        public Guid DeckId { get; set; }
        public Language Language { get; set; }
        public GrammaticalGender Gender { get; set; }
        public string? Plural { get; set; }
        public string? Pronunciation { get; set; }
    }
}
