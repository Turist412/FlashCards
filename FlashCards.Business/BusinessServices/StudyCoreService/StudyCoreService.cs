using FlashCards.Core.Enums;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text;
using System.Text.RegularExpressions;

namespace FlashCards.Business.BusinessServices.StudyCoreService
{
    public class StudyCoreService : IStudyCoreService
    {
        private readonly FlashCardsDbContext _context;
        private readonly Random _random = Random.Shared;

        private readonly List<(string Original, string[] Fakes)> _germanRules = new()
    {
        ("ei", new[] { "ie", "ai", "ey" }),
        ("ie", new[] { "ei", "i", "ih" }),
        ("eu", new[] { "äu", "oi" }),
        ("äu", new[] { "eu" }),
        ("ä",  new[] { "e" }),
        ("e",  new[] { "ä" }),
        ("v",  new[] { "f", "w", "ph" }),
        ("f",  new[] { "v", "ph" }),
        ("ph", new[] { "f" }),
        ("dt", new[] { "t", "tt" }),
        ("t",  new[] { "dt", "th" }),
        ("ks", new[] { "x", "chs" }),
        ("x",  new[] { "ks", "chs" }),
        ("sch",new[] { "sh", "ch" }),
        ("ss", new[] { "ß", "s" }),
        ("ß",  new[] { "ss", "s" }),
        ("h",  new[] { "" }) // Немая H
    };

        public StudyCoreService(FlashCardsDbContext context)
        {
            _context = context;
        }

        public int GetIntervalDays(int level)
        {
            return level switch
            {
                1 => 1,    // Tomorrow
                2 => 3,    // In 3 days
                3 => 7,    // In a week
                4 => 14,   // In 2 weeks
                5 => 30,   // In a month
                6 => 90,   // In 3 months
                _ => 180   // In 6 months (for very old words)
            };
        }

        public DateTime CalculateNextReview(int level)
        {
            return DateTime.UtcNow.AddDays(GetIntervalDays(level));
        }

        public async Task<List<string>> GenerateDistractorsAsync(
            string correctAnswer,
            CardLanguage targetLanguage,
            bool targetIsTranslation,
            int count)
        {
            List<string> distractors = new();

            if (targetIsTranslation)
            {
                var dictWords = await _context.DictionaryWords
                    .Where(w => w.Language == CardLanguage.Russian && w.Text != correctAnswer)
                    .OrderBy(r => Guid.NewGuid())
                    .Take(count)
                    .Select(w => w.Text)
                    .ToListAsync();

                distractors.AddRange(dictWords);

                if (distractors.Count < count) // TODO: delete this fallback after we have enough words in the dictionary
                {
                    var needed = count - distractors.Count;

                    var userWords = await _context.Cards
                        .Where(c => c.Language == targetLanguage && c.BackText != correctAnswer)
                        .OrderBy(r => Guid.NewGuid())
                        .Take(needed)
                        .Select(c => c.BackText)
                        .ToListAsync();

                    distractors.AddRange(userWords);
                }
            }
            else
            {
                var dictWords = await _context.DictionaryWords
                    .Where(w => w.Language == targetLanguage && w.Text != correctAnswer)
                    .OrderBy(r => Guid.NewGuid())
                    .Take(count)
                    .Select(w => w.Text)
                    .ToListAsync();

                distractors.AddRange(dictWords);

                if (distractors.Count < count) // TODO: delete this fallback after we have enough words in the dictionary
                {
                    var needed = count - distractors.Count;

                    var userWords = await _context.Cards
                        .Where(c => c.Language == targetLanguage && c.FrontText != correctAnswer)
                        .OrderBy(r => Guid.NewGuid())
                        .Take(needed)
                        .Select(c => c.FrontText)
                        .ToListAsync();

                    distractors.AddRange(userWords);
                }
            }

            while (distractors.Count < count)
            {
                distractors.Add(targetIsTranslation ? "Нет данных" : "No Data");
            }

            return distractors;
        }

        public List<string> GenerateSpellingDistractors(string correctWord, CardLanguage language, int count)
        {
            if (language != CardLanguage.German)
            {
                return new List<string>(); 
            }

            if (string.IsNullOrWhiteSpace(correctWord)) return new List<string>();

            var candidates = new HashSet<string>();

            foreach (var rule in _germanRules)
            {
                var matches = Regex.Matches(correctWord, rule.Original, RegexOptions.IgnoreCase);

                foreach (Match match in matches)
                {
                    foreach (var fake in rule.Fakes)
                    {
                        var sb = new StringBuilder(correctWord);
                        sb.Remove(match.Index, match.Length);
                        sb.Insert(match.Index, MatchCase(match.Value, fake));

                        var newWord = sb.ToString();
                        if (!newWord.Equals(correctWord, StringComparison.OrdinalIgnoreCase))
                        {
                            candidates.Add(newWord);
                        }
                    }
                }
            }

            candidates.UnionWith(GenerateDoubleConsonantErrors(correctWord));

            return candidates.OrderBy(_ => _random.Next()).Take(count).ToList();
        }

        private string MatchCase(string original, string fake)
        {
            if (string.IsNullOrEmpty(original) || string.IsNullOrEmpty(fake)) return fake;
            return char.IsUpper(original[0]) ? char.ToUpper(fake[0]) + fake.Substring(1) : fake;
        }


        private IEnumerable<string> GenerateDoubleConsonantErrors(string word)
        {
            var results = new List<string>();
            string consonants = "bdfglmnprst";
            string vowels = "aeiouäöü";

            for (int i = 0; i < word.Length; i++)
            {
                char c = char.ToLower(word[i]);

                // 1. ЛОГИКА УБРАТЬ УДВОЕНИЕ (Kommentieren -> Komentieren)
                // Если текущая и следующая буквы одинаковы и это целевая согласная
                if (i < word.Length - 1 && char.ToLower(word[i + 1]) == c && consonants.Contains(c))
                {
                    results.Add(word.Remove(i, 1));
                    // Пропускаем следующую итерацию, чтобы не обработать вторую букву пары
                    i++;
                    continue;
                }

                // 2. ЛОГИКА ДОБАВИТЬ УДВОЕНИЕ (Vater -> Vatter)
                // Удваиваем ТОЛЬКО если:
                // а) Это не первая буква
                // б) Это одна из наших согласных
                // в) ПЕРЕД ней стоит гласная (Hund -> Hunnd - ок, но Hund -> Hundd - нет)
                // г) Перед этой гласной НЕТ другой гласной (чтобы исключить дифтонги типа 'au', 'ei', 'ie', где удвоение невозможно)
                else if (i > 0 && consonants.Contains(c))
                {
                    char prevChar = char.ToLower(word[i - 1]);

                    // Проверка: перед согласной должна быть гласная
                    bool precededByVowel = vowels.Contains(prevChar);

                    // Проверка: перед этой гласной не должно быть еще одной гласной (дифтонг/долгота)
                    // Например: "Boot" (oo - долгая), "Haus" (au - дифтонг). Там удваивать нельзя.
                    bool precededByDiphthong = i > 1 && vowels.Contains(char.ToLower(word[i - 2]));

                    if (precededByVowel && !precededByDiphthong)
                    {
                        results.Add(word.Insert(i, c.ToString()));
                    }
                }
            }
            return results;
        }

        public List<string> GenerateNumberDistractors(int correctNumber, CardLanguage language, int count = 3)
        {
            var fakes = new HashSet<int>();
            var random = Random.Shared;

            string correctStr = correctNumber.ToString();
            if (language == CardLanguage.German && correctNumber >= 13 && correctStr.Length >= 2)
            {
                char units = correctStr[^1];
                char tens = correctStr[^2];

                if (units != tens)
                {
                    string swappedStr = correctStr[..^2] + units + tens;

                    if (int.TryParse(swappedStr, out int swappedInt))
                    {
                        fakes.Add(swappedInt);
                    }
                }
            }

            int attempts = 0;
            while (fakes.Count < count && attempts < 20)
            {
                char[] mutated = correctStr.ToCharArray();

                int mutationsCount = random.Next(1, Math.Min(3, mutated.Length + 1));

                for (int i = 0; i < mutationsCount; i++)
                {
                    int idx = random.Next(0, mutated.Length);
                    char newDigit = (char)('0' + random.Next(0, 10));

                    if (idx == 0 && mutated.Length > 1 && newDigit == '0')
                    {
                        newDigit = (char)('1' + random.Next(0, 9));
                    }

                    mutated[idx] = newDigit;
                }

                string mutatedStr = new string(mutated);
                if (int.TryParse(mutatedStr, out int mutatedInt) && mutatedInt != correctNumber)
                {
                    fakes.Add(mutatedInt);
                }

                attempts++;
            }

            
            int[] roundNumbers = { 10, 20, 50, 100, 500, 1000, 10000, 100000, 1000000 };

            while (fakes.Count < count)
            {
                int fake;
                if (correctNumber < 10 || random.Next(0, 3) == 0)
                {
                    fake = random.Next(1, 10);
                }
                else
                {
                    fake = roundNumbers[random.Next(roundNumbers.Length)];
                }

                if (fake != correctNumber)
                {
                    fakes.Add(fake);
                }
            }

            return fakes.Take(count).Select(f => f.ToString()).ToList();
        }

    }
}
