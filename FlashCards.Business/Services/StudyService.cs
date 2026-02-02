using FlashCards.Business.DTOs;
using FlashCards.Business.Interfaces;
using FlashCards.Business.Mappers;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Business.Services
{
    public class StudyService : IStudyInterface
    {
        private readonly FlashCardsDbContext _context;
        private readonly FakeUserContext _userContext;
        StudyService(FlashCardsDbContext context, FakeUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<CardDTO> ProcessStudyResult(Guid cardId, bool isCorrect)
        {
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
