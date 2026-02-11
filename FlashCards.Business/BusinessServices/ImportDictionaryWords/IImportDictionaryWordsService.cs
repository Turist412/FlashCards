using FlashCards.Core.Enums;
using Microsoft.AspNetCore.Http;

namespace FlashCards.Business.BusinessServices.ImportDictionaryWords
{
    public interface IImportDictionaryWordsService
    {
        Task<int> ImportWordsAsync(IFormFile file, CardLanguage language);
    }
}
