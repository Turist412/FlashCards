namespace FlashCards.Business.DTOs
{
    public class DeckDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt  { get; set; }
        public int CardCount { get; set; }

    }
}
