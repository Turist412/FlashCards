using FlashCards.Core.Enums;

namespace FlashCards.Business.Interfaces
{
    public interface IStudyCoreService
    {
        int GetIntervalDays(int reviewCount);
        DateTime CalculateNextReview(int level);
        Task<List<string>> GenerateDistractorsAsync(string correctAnswer, CardLanguage targetLanguage, bool targetIsTranslation, int count);
        List<string> GenerateSpellingDistractors(string correctAnswer, CardLanguage language, int count);
    }
}
