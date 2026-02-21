using FlashCards.Business.DTOs;
using FlashCards.Business.Services.StudyService;
using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase 
    {
        private readonly IStudyService _studyService;
        public StudyController(IStudyService studyService)
        {
            _studyService = studyService;
        }

        [HttpGet]
        public async Task<ActionResult<ICollection<StudyCardDTO>>> GetCardsForStudySession(
            [FromQuery] Guid? deckId,
            [FromQuery] QuestionType questionType,
            [FromQuery] bool isSRS)
        {
            Console.WriteLine($"Received request for study session with deckId: {deckId}, questionType: {questionType}, isSRS: {isSRS}");
            var cards = await _studyService.GetCardsForStudySessionAsync(deckId, questionType, isSRS);
            return Ok(cards);
        }

        [HttpPut]
        public async Task<ActionResult<CardDTO>> ProcessStudyResult(
            [FromBody] StudyResultDTO request)
        {
            var updatedCard = await _studyService.ProcessStudyResult(request.CardId, request.IsCorrect);
            return Ok(updatedCard);
        }

        [HttpGet("numbers-session")]
        public ActionResult<ICollection<StudyCardDTO>> GetNumbersStudySession(
            [FromQuery] int min,
            [FromQuery] int max,
            [FromQuery] int count,
            [FromQuery] CardLanguage language,
            [FromQuery] bool isAudioMode) // true = Voice, false = Text
        {
            Console.WriteLine($"Received request for numbers study session with min: {min}, max: {max}, count: {count}, language: {language}, isAudioMode: {isAudioMode}");
            var cards = _studyService.GenerateNumberSession(min, max, count, language, isAudioMode);
            return Ok(cards);
        }
    }
}
