using FlashCards.Business.BusinessServices.ImportDictionaryWords;
using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportDictionaryWordsController : ControllerBase
    {
        private readonly IImportDictionaryWordsService _importService;
        public ImportDictionaryWordsController(IImportDictionaryWordsService importService)
        {
            _importService = importService;
        }

        [HttpPost("upload-words")]
        public async Task<IActionResult> UploadWords(
        [FromForm] IFormFile file,
        [FromForm] CardLanguage language)
        {
            try
            {
                var count = await _importService.ImportWordsAsync(file, language);
                return Ok(new { message = $"Успешно загружено {count} слов." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

}
