using FlashCards.Business.BusinessServices.ImportDictionaryWords;
using FlashCards.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Endpoints
{

    public static class ImportDictionaryWordsEndpoints
    {
        public static void MapImportDictionaryWordsEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/importdictionarywords")
                .WithTags("Import")
                .RequireAuthorization()
                .DisableAntiforgery();

            group.MapPost("/upload-words", UploadWords)
                .WithName("UploadWords")
                .Accepts<UploadWordsRequestDTO>("multipart/form-data") 
                .Produces<object>(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest);
        }

        private static async Task<IResult> UploadWords(
            [FromForm] UploadWordsRequestDTO request, 
            IImportDictionaryWordsService importService)
        {
            try
            {
                var count = await importService.ImportWordsAsync(request.File, request.Language);
                return Results.Ok(new { message = $"Успешно загружено {count} слов." });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        }
    }
}