# Скрипт для создания и применения миграции Identity

Write-Host "=== Создание и применение миграции для Identity ===" -ForegroundColor Green

# Переходим в папку Data проекта
Set-Location "D:\Program Files\VisualStudioProjects\FlashCards\FlashCards.Data"

Write-Host "`nШаг 1: Создание миграции AddIdentity..." -ForegroundColor Yellow
dotnet ef migrations add AddIdentity --startup-project ..\FlashCards.Web\FlashCards.Web.csproj

if ($LASTEXITCODE -eq 0) {
    Write-Host "Миграция успешно создана!" -ForegroundColor Green

    Write-Host "`nШаг 2: Применение миграции к базе данных..." -ForegroundColor Yellow
    dotnet ef database update --startup-project ..\FlashCards.Web\FlashCards.Web.csproj

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nМиграция успешно применена!" -ForegroundColor Green
        Write-Host "`nБаза данных обновлена. Теперь вы можете запустить приложение." -ForegroundColor Cyan
    } else {
        Write-Host "`nОшибка при применении миграции!" -ForegroundColor Red
    }
} else {
    Write-Host "`nОшибка при создании миграции!" -ForegroundColor Red
}

# Возвращаемся в папку Web
Set-Location ..\FlashCards.Web

Write-Host "`nГотово! Нажмите любую клавишу для выхода..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
