using FlashCards.Core.Enums;

namespace FlashCards.Business.BusinessServices.StudyCoreService
{
    public interface IStudyCoreService
    {
        int GetIntervalDays(int reviewCount);
        DateTime CalculateNextReview(int level);
        Task<List<string>> GenerateDistractorsAsync(string correctAnswer, CardLanguage targetLanguage, bool targetIsTranslation, int count);
        List<string> GenerateSpellingDistractors(string correctAnswer, CardLanguage language, int count);
        public List<string> GenerateNumberDistractors(int correctNumber, CardLanguage language, int count = 3);

    }
}
