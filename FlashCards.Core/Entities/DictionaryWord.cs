using FlashCards.Core.Enums;

namespace FlashCards.Core.Entities
{
    public class DictionaryWord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Text { get; set; }
        public CardLanguage Language { get; set; }
        public GrammaticalGender? Gender { get; set; }
    }

}

