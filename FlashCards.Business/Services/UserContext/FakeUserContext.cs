namespace FlashCards.Business.Services.UserContext
{
    public class FakeUserContext : IUserContext
    {
        public Guid CurrentUserId => Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    }
}
