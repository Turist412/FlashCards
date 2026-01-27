namespace FlashCards.Core.Entities
{
    public class Deck
    {
        public Guid Id { get; set; }  = Guid.NewGuid();
        public Guid UserId { get; set; }
        public ICollection<Card> Cards { get; set; } = new List<Card>();
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
