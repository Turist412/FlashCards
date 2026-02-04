using FlashCards.Business.DTOs;
using FlashCards.Business.Interfaces;
using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase 
    {
        private readonly IStudyInterface _studyService;
        public StudyController(IStudyInterface studyService)
        {
            _studyService = studyService;
        }

        [HttpGet]
        public async Task<ActionResult<ICollection<StudyCardDTO>>> GetCardsForStudySession(
            [FromQuery] Guid? deckId,
            [FromQuery] QuestionType questionType,
            [FromQuery] bool isSRS)
        {
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
    }
}
