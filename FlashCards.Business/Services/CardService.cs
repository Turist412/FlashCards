using FlashCards.Business.DTOs;
using FlashCards.Business.Interfaces;
using FlashCards.Core.Entities;
using FlashCards.Data;
using FlashCards.Business.Mappers;
using Microsoft.EntityFrameworkCore;
namespace FlashCards.Business.Services
{
    public class CardService : ICardService
    {
        private readonly FlashCardsDbContext _context;
        private readonly IUserContext _userContext;
        public CardService(FlashCardsDbContext context, IUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }
        public async Task<CardDTO> CreateAsync(CreateCardDTO createCardDto)
        {
            var deckExists = await _context.Decks
                .AsNoTracking()
                .AnyAsync(d => d.Id == createCardDto.DeckId && d.UserId == _userContext.CurrentUserId);

            if(!deckExists)
            {
                throw new ArgumentException("Deck does not exist or does not belong to the current user.");
            }

            var card = createCardDto.ToEntity();
            card.UserId = _userContext.CurrentUserId;

            _context.Cards.Add(card);
            await _context.SaveChangesAsync();
            return card.ToCardDTO();

        }

        public async Task<bool> DeleteAsync(Guid id)
        {

            var affectedRows = await _context.Cards
                .Where(c => c.UserId == _userContext.CurrentUserId && c.Id == id)
                .ExecuteDeleteAsync();

            return affectedRows > 0;
        }

        public async Task<CardDTO?> GetByIdAsync(Guid id)
        {
            var card = await _context.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == _userContext.CurrentUserId);

            if(card == null)
            {
                return null;
            }
            return card.ToCardDTO();
        }

        public async Task<ICollection<CardDTO>> GetAllByDeckIdAsync(Guid deckId)
        {
            var cards = await _context.Cards
                .AsNoTracking()
                .Where(c => c.DeckId == deckId && c.UserId == _userContext.CurrentUserId)
                .ToListAsync();

            return cards.Select(c => c.ToCardDTO()).ToList();
        }

        public async Task<CardDTO?> UpdateAsync(Guid cardId, CreateCardDTO createCardDTO)
        {
            var card = await _context.Cards
                .FirstOrDefaultAsync(c => c.Id == cardId && c.UserId == _userContext.CurrentUserId);

            if(card == null)
            {
                return null;
            }

            if(card.DeckId != createCardDTO.DeckId)
            {
                var targetDeckExists = await _context.Decks
                    .AsNoTracking()
                    .AnyAsync(d => d.Id == createCardDTO.DeckId && d.UserId == _userContext.CurrentUserId);
                if (!targetDeckExists)
                {
                    throw new ArgumentException("Target deck does not exist or does not belong to the current user.");
                }
            }

            card.FrontText = createCardDTO.FrontText;
            card.BackText = createCardDTO.BackText;
            card.Language = createCardDTO.Language;
            card.DeckId = createCardDTO.DeckId;

            card.Gender = createCardDTO.Gender;
            card.Plural = createCardDTO.Plural;
            card.Pronunciation = createCardDTO.Pronunciation;

            await _context.SaveChangesAsync();

            return card.ToCardDTO();

        }
    }
}
