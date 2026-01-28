using FlashCards.Business.DTOs;

namespace FlashCards.Business.Interfaces
{
    public interface IDeckService
    {
        Task<DeckDTO> CreateAsync(CreateDeckDTO createDeckDto);
        Task<DeckDTO?> GetByIdAsync(Guid id);
        Task<ICollection<DeckDTO>> GetAllAsync();
        Task<bool> DeleteAsync(Guid id);
        Task<DeckDTO?> UpdateAsync(Guid id, CreateDeckDTO updateDeckDto);
    }
}
