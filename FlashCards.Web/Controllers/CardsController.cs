using FlashCards.Business.DTOs;
using FlashCards.Business.Services.CardService;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardsController : ControllerBase
    {
        private readonly ICardService _cardService;
        public CardsController(ICardService cardService)
        {
            _cardService = cardService;
        }


        [HttpGet]
        public async Task<ActionResult<ICollection<CardDTO>>> GetAllByDeckId([FromQuery] Guid deckId)
        {
            var cards = await _cardService.GetAllByDeckIdAsync(deckId);
            return Ok(cards);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<CardDTO>> GetById(Guid id)
        {
            var card = await _cardService.GetByIdAsync(id);

            if (card == null) return NotFound();

            return Ok(card);
        }


        [HttpPost]
        public async Task<ActionResult<CardDTO>> Create(CreateCardDTO createCardDTO)
        {
            var card = await _cardService.CreateAsync(createCardDTO);
            return CreatedAtAction(nameof(GetById), new { id = card.Id }, card);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<CardDTO>> Update(Guid id, CreateCardDTO updateCardDTO)
        {
            var updatedCard = await _cardService.UpdateAsync(id, updateCardDTO);
            if (updatedCard == null) return NotFound();
            return Ok(updatedCard);
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var deleted = await _cardService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
