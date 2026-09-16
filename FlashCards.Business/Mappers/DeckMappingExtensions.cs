using FlashCards.Business.DTOs;
using FlashCards.Core.Entities;

namespace FlashCards.Business.Mappers
{
    public static class DeckMappingExtensions
    {
        public static Deck ToEntity(this CreateDeckDTO createeckDTO)
        {
            return new Deck
            {
                Id = createeckDTO.Id ?? Guid.NewGuid(),
                Name = createeckDTO.Name,
            };
        }

        public static DeckDTO ToDeckDTO(this Deck deck)
        {
            return new DeckDTO
            {
                Id = deck.Id,
                Name = deck.Name,
                CreatedAt = deck.CreatedAt,
                CardCount = deck.Cards?.Count ?? 0,
            };
        }
    }
}
