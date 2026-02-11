using FlashCards.Business.DTOs;
using FlashCards.Business.Services.DeckService;
using Microsoft.AspNetCore.Mvc;

namespace FlashCards.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DecksController : ControllerBase
    {
        private readonly IDeckService _deckService;
        public DecksController(IDeckService deckService)
        {
            _deckService = deckService;
        }


        [HttpGet]
        public async Task<ActionResult<ICollection<DeckDTO>>> GetAll()
        {
            var decks = await _deckService.GetAllAsync();
            return Ok(decks);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<DeckDTO>> GetById(Guid id)
        {
            var deck = await _deckService.GetByIdAsync(id);

            if (deck == null) return NotFound();

            return Ok(deck);
        }


        [HttpPost]
        public async Task<ActionResult<DeckDTO>> Create (CreateDeckDTO createDeckDTO)
        {
            var deck = await _deckService.CreateAsync(createDeckDTO);
            return CreatedAtAction(nameof(GetById), new { id = deck.Id }, deck);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<DeckDTO>> Update(Guid id, CreateDeckDTO updateDeckDTO)
        {
            var updatedDeck = await _deckService.UpdateAsync(id, updateDeckDTO);
            if (updatedDeck == null) return NotFound();
            return Ok(updatedDeck);
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var deleted = await _deckService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }

}
