using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Http;

namespace FlashCards.Business.DTOs
{
    public class UploadWordsRequestDTO
    {
        public IFormFile File { get; set; } = null!;
        public CardLanguage Language { get; set; }
    }
}
