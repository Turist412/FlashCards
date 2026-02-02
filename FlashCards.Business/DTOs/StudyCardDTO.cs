using FlashCards.Core.Enums;

namespace FlashCards.Business.DTOs
{
    public class StudyCardDTO
    {
        public Guid Id { get; set; }
        public Guid DeckId { get; set; }
        public string FrontText { get; set; }
        public string BackText { get; set; }
        public Language? Language { get; set; }
        public GrammaticalGender? Gender { get; set; }
        public string? Plural { get; set; }
        public string? Pronunciation { get; set; }
        public QuestionType QuestionType { get; set; }
        public bool CheckFrontText { get; set; } = true;
        public ICollection<string> PossibleAnswers { get; set; } = new List<string>();
    }
}
