using FlashCards.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlashCards.Business.DTOs
{
    public class DeckDTO
    {
        public Guid Id { get; set; }
        string Name { get; set; }
        public ICollection<CardDTO> Card { get; set; }
        public DateTime CreatedAt  { get; set; }

    }
}
