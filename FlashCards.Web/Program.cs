using FlashCards.Business.Interfaces;
using FlashCards.Business.Services;
using FlashCards.Data;
using Microsoft.AspNetCore.Builder;
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
            builder.Services.AddScoped<IDeckService, DeckService>();
            builder.Services.AddScoped<ICardService, CardService>();
            builder.Services.AddScoped<IStudyInterface, StudyService>();
            builder.Services.AddScoped<IStudyCoreService, StudyCoreService>();

            builder.Services.AddOpenApi();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200") // frontend URL
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAngular");
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
