using FlashCards.Business.DTOs;
using FlashCards.Business.Interfaces;
using FlashCards.Business.Mappers;
using FlashCards.Data;

namespace FlashCards.Business.Services
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
            var Deck = createDeckDto.ToEntity();

            Deck.UserId = _userContext.CurrentUserId;
            _context.Decks.Add(Deck);
            await _context.SaveChangesAsync();

            return Deck.ToDeckDTO();
        }

        public Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<ICollection<DeckDTO>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<DeckDTO?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<DeckDTO> UpdateAsync(Guid id, CreateDeckDTO updateDeckDto)
        {
            throw new NotImplementedException();
        }
    }
}
