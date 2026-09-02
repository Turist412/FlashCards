using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashCards.Data.Migrations
{
    /// <summary>
    /// Миграция для связывания существующих Card и Deck с пользователями
    /// ВНИМАНИЕ: Этот шаблон нужно настроить под ваши нужды!
    /// </summary>
    public partial class LinkExistingDataToUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Вариант 1: Если у вас есть конкретный UserId для существующих данных
            // var defaultUserId = new Guid("ваш-user-id-здесь");

            // migrationBuilder.Sql($@"
            //     UPDATE Cards 
            //     SET UserId = '{defaultUserId}' 
            //     WHERE UserId = '00000000-0000-0000-0000-000000000000'
            // ");

            // migrationBuilder.Sql($@"
            //     UPDATE Decks 
            //     SET UserId = '{defaultUserId}' 
            //     WHERE UserId = '00000000-0000-0000-0000-000000000000'
            // ");

            // Вариант 2: Создать нового пользователя и связать все данные с ним
            // var migrationUserId = Guid.NewGuid();
            // var hashedPassword = "..."; // Используйте PasswordHasher для создания хеша

            // migrationBuilder.Sql($@"
            //     INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, 
            //                             EmailConfirmed, PasswordHash, SecurityStamp, CreatedAt)
            //     VALUES ('{migrationUserId}', 
            //             'migration_user', 
            //             'MIGRATION_USER',
            //             'migration@flashcards.local',
            //             'MIGRATION@FLASHCARDS.LOCAL',
            //             1,
            //             '{hashedPassword}',
            //             '{Guid.NewGuid()}',
            //             GETUTCDATE())
            // ");

            // migrationBuilder.Sql($@"
            //     UPDATE Cards SET UserId = '{migrationUserId}'
            // ");

            // migrationBuilder.Sql($@"
            //     UPDATE Decks SET UserId = '{migrationUserId}'
            // ");

            // Вариант 3: Удалить все существующие данные (ОСТОРОЖНО!)
            // migrationBuilder.Sql("DELETE FROM Cards");
            // migrationBuilder.Sql("DELETE FROM Decks");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Откат изменений
            // migrationBuilder.Sql(@"
            //     UPDATE Cards SET UserId = '00000000-0000-0000-0000-000000000000'
            // ");

            // migrationBuilder.Sql(@"
            //     UPDATE Decks SET UserId = '00000000-0000-0000-0000-000000000000'
            // ");
        }
    }
}
