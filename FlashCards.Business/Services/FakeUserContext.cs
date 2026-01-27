using FlashCards.Business.Interfaces;

namespace FlashCards.Business.Services
{
    public class FakeUserContext : IUserContext
    {
        public Guid CurrentUserId => Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    }
}
