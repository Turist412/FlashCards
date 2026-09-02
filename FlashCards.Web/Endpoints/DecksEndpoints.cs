using FlashCards.Business.DTOs;
using FlashCards.Business.Services.DeckService;

namespace FlashCards.Web.Endpoints
{
    public static class DecksEndpoints
    {
        public static void MapDecksEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/decks")
                .WithTags("Decks")
                .RequireAuthorization();

            group.MapGet("/", GetAll)
                .WithName("GetAllDecks")
                .Produces<ICollection<DeckDTO>>(StatusCodes.Status200OK);

            group.MapGet("/{id}", GetById)
                .WithName("GetDeckById")
                .Produces<DeckDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

            group.MapPost("/", Create)
                .WithName("CreateDeck")
                .Produces<DeckDTO>(StatusCodes.Status201Created);

            group.MapPut("/{id}", Update)
                .WithName("UpdateDeck")
                .Produces<DeckDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

            group.MapDelete("/{id}", Delete)
                .WithName("DeleteDeck")
                .Produces(StatusCodes.Status204NoContent)
                .Produces(StatusCodes.Status404NotFound);
        }

        private static async Task<IResult> GetAll(IDeckService deckService)
        {
            var decks = await deckService.GetAllAsync();
            return Results.Ok(decks);
        }

        private static async Task<IResult> GetById(Guid id, IDeckService deckService)
        {
            var deck = await deckService.GetByIdAsync(id);
            return deck == null ? Results.NotFound() : Results.Ok(deck);
        }

        private static async Task<IResult> Create(
            CreateDeckDTO createDeckDTO,
            IDeckService deckService)
        {
            var deck = await deckService.CreateAsync(createDeckDTO);
            return Results.CreatedAtRoute("GetDeckById", new { id = deck.Id }, deck);
        }

        private static async Task<IResult> Update(
            Guid id,
            CreateDeckDTO updateDeckDTO,
            IDeckService deckService)
        {
            var updatedDeck = await deckService.UpdateAsync(id, updateDeckDTO);
            return updatedDeck == null ? Results.NotFound() : Results.Ok(updatedDeck);
        }

        private static async Task<IResult> Delete(Guid id, IDeckService deckService)
        {
            var deleted = await deckService.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
