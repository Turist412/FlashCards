using FlashCards.Business.DTOs;
using FlashCards.Business.Services.CardService;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Endpoints
{
    public static class CardsEndpoints
    {
        public static void MapCardsEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/cards")
                .WithTags("Cards")
                .RequireAuthorization();

            group.MapGet("/", GetAllByDeckId)
                .WithName("GetCardsByDeck")
                .Produces<ICollection<CardDTO>>(StatusCodes.Status200OK);

            group.MapGet("/{id}", GetById)
                .WithName("GetCardById")
                .Produces<CardDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

            group.MapPost("/", Create)
                .WithName("CreateCard")
                .Produces<CardDTO>(StatusCodes.Status201Created);

            group.MapPut("/{id}", Update)
                .WithName("UpdateCard")
                .Produces<CardDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

            group.MapDelete("/{id}", Delete)
                .WithName("DeleteCard")
                .Produces(StatusCodes.Status204NoContent)
                .Produces(StatusCodes.Status404NotFound);
        }

        private static async Task<IResult> GetAllByDeckId(
            [FromQuery] Guid deckId,
            ICardService cardService)
        {
            var cards = await cardService.GetAllByDeckIdAsync(deckId);
            return Results.Ok(cards);
        }

        private static async Task<IResult> GetById(
            Guid id,
            ICardService cardService)
        {
            var card = await cardService.GetByIdAsync(id);
            return card == null ? Results.NotFound() : Results.Ok(card);
        }

        private static async Task<IResult> Create(
            CreateCardDTO createCardDTO,
            ICardService cardService)
        {
            var card = await cardService.CreateAsync(createCardDTO);
            return Results.CreatedAtRoute("GetCardById", new { id = card.Id }, card);
        }

        private static async Task<IResult> Update(
            Guid id,
            CreateCardDTO updateCardDTO,
            ICardService cardService)
        {
            var updatedCard = await cardService.UpdateAsync(id, updateCardDTO);
            return updatedCard == null ? Results.NotFound() : Results.Ok(updatedCard);
        }

        private static async Task<IResult> Delete(
            Guid id,
            ICardService cardService)
        {
            var deleted = await cardService.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
