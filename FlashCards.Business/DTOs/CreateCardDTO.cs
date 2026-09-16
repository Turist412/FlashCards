using FlashCards.Core.Enums;

namespace FlashCards.Business.DTOs
{
    public class CreateCardDTO
    {
        public Guid? Id { get; set; }
        public string FrontText { get; set; }
        public string BackText { get; set; }
        public Guid DeckId { get; set; }
        public CardLanguage Language { get; set; }
        public GrammaticalGender Gender { get; set; }
        public string? Plural { get; set; }
        public string? Pronunciation { get; set; }
    }
}
