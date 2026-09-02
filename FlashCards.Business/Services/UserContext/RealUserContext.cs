using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace FlashCards.Business.Services.UserContext
{
    public class RealUserContext : IUserContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RealUserContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid CurrentUserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }

                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }

                throw new InvalidOperationException("Invalid user ID format");
            }
        }
    }
}
