using FlashCards.Business.DTOs;
using FlashCards.Business.Services.StudyService;
using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Endpoints
{
    public static class StudyEndpoints
    {
        public static void MapStudyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/study")
                .WithTags("Study")
                .RequireAuthorization();

            group.MapGet("/", GetCardsForStudySession)
                .WithName("GetStudyCards")
                .Produces<ICollection<StudyCardDTO>>(StatusCodes.Status200OK);

            group.MapPut("/", ProcessStudyResult)
                .WithName("ProcessStudyResult")
                .Produces<CardDTO>(StatusCodes.Status200OK);

            group.MapGet("/numbers-session", GetNumbersStudySession)
                .WithName("GetNumbersStudySession")
                .Produces<ICollection<StudyCardDTO>>(StatusCodes.Status200OK);
        }

        private static async Task<IResult> GetCardsForStudySession(
            [FromQuery] Guid? deckId,
            [FromQuery] QuestionType questionType,
            [FromQuery] bool isSRS,
            IStudyService studyService)
        {
            Console.WriteLine($"Received request for study session with deckId: {deckId}, questionType: {questionType}, isSRS: {isSRS}");
            var cards = await studyService.GetCardsForStudySessionAsync(deckId, questionType, isSRS);
            return Results.Ok(cards);
        }

        private static async Task<IResult> ProcessStudyResult(
            StudyResultDTO request,
            IStudyService studyService)
        {
            var updatedCard = await studyService.ProcessStudyResult(request.CardId, request.IsCorrect);
            return Results.Ok(updatedCard);
        }

        private static IResult GetNumbersStudySession(
            [FromQuery] int min,
            [FromQuery] int max,
            [FromQuery] int count,
            [FromQuery] CardLanguage language,
            [FromQuery] bool isAudioMode,
            IStudyService studyService)
        {
            Console.WriteLine($"Received request for numbers study session with min: {min}, max: {max}, count: {count}, language: {language}, isAudioMode: {isAudioMode}");
            var cards = studyService.GenerateNumberSession(min, max, count, language, isAudioMode);
            return Results.Ok(cards);
        }
    }
}
