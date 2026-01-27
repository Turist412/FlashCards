namespace FlashCards.Business.Interfaces
{
    public interface IUserContext
    {
        Guid CurrentUserId { get; }
    }
}
