using FlashCards.Business.Interfaces;
using FlashCards.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlashCards.Business.Services
{
    public class DeckService : IDeckService
    {
        private readonly FlashCardsDbContext _context;
        private readonly IUserContext _userContext;

        public DeckService(FlashCardsDbContext context, IUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }


    }
}
