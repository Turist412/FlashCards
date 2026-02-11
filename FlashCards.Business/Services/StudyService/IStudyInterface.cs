using FlashCards.Business.DTOs;
using FlashCards.Core.Enums;

namespace FlashCards.Business.Services.StudyService
{
    public interface IStudyInterface
    {
        public Task<CardDTO> ProcessStudyResult(Guid cardId, bool isCorrect);
        public Task<ICollection<StudyCardDTO>> GetCardsForStudySessionAsync(Guid? deckId, QuestionType requestedType, bool isSRS);
    }
}
