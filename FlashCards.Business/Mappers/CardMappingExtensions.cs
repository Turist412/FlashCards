using FlashCards.Business.DTOs;
using FlashCards.Core.Entities;

namespace FlashCards.Business.Mappers
{
    public static class CardMappingExtensions
    {
        public static Card ToEntity(this CreateCardDTO createCardDto)
        {
            return new Card
            {
                FrontText = createCardDto.FrontText,
                BackText = createCardDto.BackText,
                DeckId = createCardDto.DeckId,
                Language = createCardDto.Language,
                Gender = createCardDto.Gender,
                Plural = createCardDto.Plural,
                Pronunciation = createCardDto.Pronunciation,
            };
        }

        public static CardDTO ToCardDTO(this Card card)
        {
            return new CardDTO
            {
                Id = card.Id,
                DeckId = card.DeckId,
                FrontText = card.FrontText,
                BackText = card.BackText,
                Language = card.Language,
                CreatedAt = card.CreatedAt,
                ReviewCount = card.ReviewCount,
                NextReviewDate = card.NextReviewDate,
                Gender = card.Gender,
                Plural = card.Plural,
                Pronunciation = card.Pronunciation,
            };
        }
    }
}
