using FlashCards.Business.DTOs;

namespace FlashCards.Business.Services.CardService
{
    public interface ICardService
    {
        public Task<CardDTO> CreateAsync(CreateCardDTO createCardDto);
        public Task<CardDTO?> GetByIdAsync(Guid id);
        public Task<ICollection<CardDTO>> GetAllByDeckIdAsync(Guid deckId);
        public Task<CardDTO?> UpdateAsync(Guid cardId, CreateCardDTO createCardDTO);
        public Task<bool> DeleteAsync(Guid id);
    }
}
