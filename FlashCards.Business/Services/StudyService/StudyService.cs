using FlashCards.Business.BusinessServices.StudyCoreService;
using FlashCards.Business.DTOs;
using FlashCards.Business.Mappers;
using FlashCards.Business.Services.UserContext;
using FlashCards.Core.Enums;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Business.Services.StudyService
{
    public class StudyService : IStudyInterface
    {
        private readonly FlashCardsDbContext _context;
        private readonly IUserContext _userContext;
        private readonly IStudyCoreService _studyCoreService;

        public StudyService(FlashCardsDbContext context, IUserContext userContext, IStudyCoreService studyCoreService)
        {
            _context = context;
            _userContext = userContext;
            _studyCoreService = studyCoreService;
        }

        public async Task<CardDTO> ProcessStudyResult(Guid cardId, bool isCorrect)
        {

            Console.WriteLine($"Processing study result for cardId: {cardId}, isCorrect: {isCorrect}");
            var card = await _context.Cards
                .FirstOrDefaultAsync(c => c.Id == cardId && c.UserId == _userContext.CurrentUserId);

            if(card == null) throw new KeyNotFoundException("Card not found.");

            if (!isCorrect)
            {
                card.ReviewCount = 0;
                card.NextReviewDate = DateTime.UtcNow;
            }
            else
            {
                card.ReviewCount += 1;
                card.NextReviewDate = _studyCoreService.CalculateNextReview(card.ReviewCount);
            }
            await _context.SaveChangesAsync();

            return card.ToCardDTO();
        }

        public async Task<ICollection<StudyCardDTO>> GetCardsForStudySessionAsync(
            Guid? deckId,
            QuestionType requestedType,
            bool isSRS)
        {
            Console.WriteLine($"deckId: {deckId}, requestedType: {requestedType}, isSRS: {isSRS}");
            var query = _context.Cards
                .Where(c => c.Deck.UserId == _userContext.CurrentUserId);

            if (deckId.HasValue)
            {
                query = query.Where(c => c.DeckId == deckId.Value);
            }

            if (isSRS)
            {
                query = query.Where(c => c.NextReviewDate <= DateTime.UtcNow)
                             .OrderBy(c => c.NextReviewDate)
                             .Take(20);
            }
            else
            {
                query = query.OrderBy(x => Guid.NewGuid())
                             .Take(100);
            }

            var cards = await query.ToListAsync();
            var resultDtos = new List<StudyCardDTO>();
            var random = Random.Shared;

            foreach (var card in cards)
            {
                var effectiveType = requestedType;

                bool askFront;
                if (effectiveType == QuestionType.MultipleGrammarChoice || effectiveType == QuestionType.VoiceMultipleChoice)
                {
                    askFront = false;
                }
                else
                {
                    askFront = random.Next(0, 2) == 0;
                }

                var dto = new StudyCardDTO
                {
                    Id = card.Id,
                    DeckId = card.DeckId,
                    FrontText = card.FrontText,
                    BackText = card.BackText,
                    Language = card.Language,
                    Gender = card.Gender,
                    Plural = card.Plural,
                    Pronunciation = card.Pronunciation,
                    QuestionType = effectiveType,
                    CheckFrontText = askFront 
                };

                string correctTarget = askFront ? card.BackText : card.FrontText;

                if (effectiveType == QuestionType.MultipleChoice || effectiveType == QuestionType.VoiceMultipleChoice)
                {
                    dto.PossibleAnswers = await _studyCoreService.GenerateDistractorsAsync(
                        correctTarget,
                        card.Language,
                        askFront,
                        3);

                    dto.PossibleAnswers.Add(correctTarget);
                    dto.PossibleAnswers = dto.PossibleAnswers.OrderBy(x => Guid.NewGuid()).ToList();
                }
                else if (effectiveType == QuestionType.TrueFalse)
                {
                    bool showCorrect = random.Next(0, 2) == 0;

                    if (showCorrect)
                    {
                        dto.DisplayedBackText = correctTarget; // True
                    }
                    else
                    {
                        var fakeWords = await _studyCoreService.GenerateDistractorsAsync(
                            correctTarget,
                            card.Language,
                            askFront,
                            1);

                        dto.DisplayedBackText = fakeWords.FirstOrDefault() ?? "Error";
                    }
                }
                else if (effectiveType == QuestionType.FillInTheBlank)
                {
                    dto.DisplayedBackText = null;
                }
                else if (effectiveType == QuestionType.MultipleGrammarChoice)
                {
                    dto.PossibleAnswers = _studyCoreService.GenerateSpellingDistractors(
                        correctTarget,
                        card.Language,
                        3);

                    dto.PossibleAnswers.Add(correctTarget);
                    dto.PossibleAnswers = dto.PossibleAnswers.OrderBy(x => Guid.NewGuid()).ToList();
                }

                resultDtos.Add(dto);
            }

            return resultDtos.OrderBy(x => Guid.NewGuid()).ToList();
        }
    }
}
