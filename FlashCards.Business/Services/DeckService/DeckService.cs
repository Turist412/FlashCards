using FlashCards.Business.DTOs;
using FlashCards.Business.Mappers;
using FlashCards.Business.Services.UserContext;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;

namespace FlashCards.Business.Services.DeckService
{
    public class DeckService : IDeckService
    {
        private readonly FlashCardsDbContext _context;
        private readonly IUserContext _userContext;

        public DeckService(FlashCardsDbContext context, IUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }
        public async Task<DeckDTO> CreateAsync(CreateDeckDTO createDeckDto)
        {

            if (createDeckDto.Id.HasValue)
            {
                var existingDeck = await _context.Decks
                    .AsNoTracking()
                    .Include(d => d.Cards)
                    .FirstOrDefaultAsync(d => d.Id == createDeckDto.Id.Value && d.UserId == _userContext.CurrentUserId);
                if (existingDeck != null)
                {
                    return existingDeck.ToDeckDTO(); 
                }
            }

            var deck = createDeckDto.ToEntity();

            deck.UserId = _userContext.CurrentUserId;
            _context.Decks.Add(deck);
            await _context.SaveChangesAsync();

            return deck.ToDeckDTO();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var deckExists = await _context.Decks
                .AnyAsync(d => d.Id == id && d.UserId == _userContext.CurrentUserId);

            if (!deckExists) return false;

            await _context.Cards
                .Where(c => c.DeckId == id)
                .ExecuteDeleteAsync();

            var deletedDecks = await _context.Decks
                .Where(d => d.Id == id)
                .ExecuteDeleteAsync();

            return deletedDecks > 0;
        }

        public async Task<ICollection<DeckDTO>> GetAllAsync()
        {
            var decks = await _context.Decks
                .AsNoTracking()
                .Include(d => d.Cards)
                .Where(d => d.UserId == _userContext.CurrentUserId)
                .ToListAsync();

            return decks.Select(d => d.ToDeckDTO()).ToList();
        }

        public async Task<DeckDTO?> GetByIdAsync(Guid id)
        {
            var deck = await _context.Decks
                .AsNoTracking()
                .Include(d => d.Cards)
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == _userContext.CurrentUserId);

            return deck?.ToDeckDTO();
        }

        public async Task<DeckDTO?> UpdateAsync(Guid id, CreateDeckDTO updateDeckDto)
        {
            var deck = await _context.Decks
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == _userContext.CurrentUserId);

            if (deck == null)
            {
                return null;
            }

            deck.Name = updateDeckDto.Name;

            await _context.SaveChangesAsync();
            return deck.ToDeckDTO();
        }
    }
}
