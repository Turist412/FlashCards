using FlashCards.Business.DTOs;
using FlashCards.Business.Interfaces;
using FlashCards.Business.Mappers;
using FlashCards.Core.Enums;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Business.Services
{
    public class StudyService : IStudyInterface
    {
        private readonly FlashCardsDbContext _context;
        private readonly IUserContext _userContext;

        public StudyService(FlashCardsDbContext context, IUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
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
                int intervalDays = GetIntervalDays(card.ReviewCount);
                card.NextReviewDate = DateTime.UtcNow.AddDays(intervalDays);
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

                bool askFront = random.Next(0, 2) == 0;

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

                if (effectiveType == QuestionType.MultipleChoice)
                {
                    dto.PossibleAnswers = await GenerateDistractorsSmartAsync(
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
                        var fakeWords = await GenerateDistractorsSmartAsync(
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

                resultDtos.Add(dto);
            }

            return resultDtos.OrderBy(x => Guid.NewGuid()).ToList();
        }

        private async Task<List<string>> GenerateDistractorsSmartAsync(
            string correctAnswer,
            CardLanguage targetLanguage,
            bool targetIsTranslation,  
            int count)
        {
            List<string> distractors = new();

            if (targetIsTranslation)
            {
                var dictWords = await _context.DictionaryWords
                    .Where(w => w.Language == CardLanguage.Russian && w.Text != correctAnswer)
                    .OrderBy(r => Guid.NewGuid())
                    .Take(count)
                    .Select(w => w.Text)
                    .ToListAsync();

                distractors.AddRange(dictWords);

                if (distractors.Count < count)
                {
                    var needed = count - distractors.Count;

                    var userWords = await _context.Cards
                        .Where(c => c.Language == targetLanguage && c.BackText != correctAnswer)
                        .OrderBy(r => Guid.NewGuid())
                        .Take(needed)
                        .Select(c => c.BackText) 
                        .ToListAsync();

                    distractors.AddRange(userWords);
                }
            }
            else
            {
                var dictWords = await _context.DictionaryWords
                    .Where(w => w.Language == targetLanguage && w.Text != correctAnswer)
                    .OrderBy(r => Guid.NewGuid())
                    .Take(count)
                    .Select(w => w.Text)
                    .ToListAsync();

                distractors.AddRange(dictWords);

                if (distractors.Count < count)
                {
                    var needed = count - distractors.Count;

                    var userWords = await _context.Cards
                        .Where(c => c.Language == targetLanguage && c.FrontText != correctAnswer)
                        .OrderBy(r => Guid.NewGuid())
                        .Take(needed)
                        .Select(c => c.FrontText) 
                        .ToListAsync();

                    distractors.AddRange(userWords);
                }
            }

            while (distractors.Count < count)
            {
                distractors.Add(targetIsTranslation ? "Нет данных" : "No Data");
            }

            return distractors;
        }


        private int GetIntervalDays(int level)
        {
            return level switch
            {
                1 => 1,    // Tomorrow
                2 => 3,    // In 3 days
                3 => 7,    // In a week
                4 => 14,   // In 2 weeks
                5 => 30,   // In a month
                6 => 90,   // In 3 months
                _ => 180   // In 6 months (for very old words)
            };
        }
    }
}
