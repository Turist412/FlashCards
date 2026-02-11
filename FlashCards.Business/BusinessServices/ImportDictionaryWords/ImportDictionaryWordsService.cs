using FlashCards.Core.Entities;
using FlashCards.Core.Enums;
using FlashCards.Data;
using Microsoft.AspNetCore.Http;

namespace FlashCards.Business.BusinessServices.ImportDictionaryWords
{
    public class ImportDictionaryWordsService : IImportDictionaryWordsService
    {
        private readonly FlashCardsDbContext _context;

        public ImportDictionaryWordsService(FlashCardsDbContext context)
        {
            _context = context;
        }

        public async Task<int> ImportWordsAsync(IFormFile file, CardLanguage language)
        {
            if (file == null || file.Length == 0) return 0;

            var newWords = new List<DictionaryWord>();

            using (var stream = file.OpenReadStream())
            using (var reader = new StreamReader(stream))
            {
                string? line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    var rawLine = line.Trim();
                    if (string.IsNullOrWhiteSpace(rawLine)) continue;

                    var wordEntry = new DictionaryWord
                    {
                        Id = Guid.NewGuid(),
                        Language = language
                    };

                    if (language == CardLanguage.German)
                    {
                        var (text, gender) = ParseGermanLine(rawLine);
                        wordEntry.Text = text;
                        wordEntry.Gender = gender;
                    }
                    else
                    {
                        wordEntry.Text = rawLine;
                        wordEntry.Gender = GrammaticalGender.None;
                    }

                    newWords.Add(wordEntry);
                }
            }

            await _context.DictionaryWords.AddRangeAsync(newWords);
            await _context.SaveChangesAsync();

            return newWords.Count;
        }

        private (string Text, GrammaticalGender Gender) ParseGermanLine(string line)
        {
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length < 2)
            {
                return (line, GrammaticalGender.None);
            }

            var article = parts[0].ToLower();

            var noun = string.Join(" ", parts.Skip(1));

            switch (article)
            {
                case "der":
                    return (noun, GrammaticalGender.Masculine);
                case "die":
                    return (noun, GrammaticalGender.Feminine);
                case "das":
                    return (noun, GrammaticalGender.Neuter);
                default:
                    return (line, GrammaticalGender.None);
            }
        }
    }
}
