using FlashCards.Business.DTOs;
using FlashCards.Core.Enums;

namespace FlashCards.Business.Interfaces
{
    public interface IStudyInterface
    {
        public Task<CardDTO> ProcessStudyResult(Guid cardId, bool isCorrect);
        public Task<ICollection<StudyCardDTO>> GetCardsForStudySessionAsync(Guid? deckId, QuestionType questionType);
        // может быть надо изменить входящие параметры
    }
}
