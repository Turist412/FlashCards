using FlashCards.Business.Interfaces;
using FlashCards.Business.Services;
using FlashCards.Data;
using Microsoft.EntityFrameworkCore;


namespace FlashCards.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");


            builder.Services.AddControllers();

            builder.Services.AddDbContext<FlashCardsDbContext>(options =>
                options.UseSqlServer(connectionString,
                b => b.MigrationsAssembly("FlashCards.Data")));

            builder.Services.AddSingleton<IUserContext, FakeUserContext>();
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
