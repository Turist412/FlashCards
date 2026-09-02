# Скрипт для создания тестового пользователя через API

$baseUrl = "https://localhost:7001"

Write-Host "=== Создание тестового пользователя ===" -ForegroundColor Green

# Данные тестового пользователя
$registerData = @{
    email = "test@flashcards.com"
    password = "Test123!"
    userName = "TestUser"
} | ConvertTo-Json

Write-Host "`nОтправка запроса на регистрацию..." -ForegroundColor Yellow
Write-Host "Email: test@flashcards.com" -ForegroundColor Cyan
Write-Host "Password: Test123!" -ForegroundColor Cyan

try {
    # Игнорируем ошибки SSL для локальной разработки
    add-type @"
        using System.Net;
        using System.Security.Cryptography.X509Certificates;
        public class TrustAllCertsPolicy : ICertificatePolicy {
            public bool CheckValidationResult(
                ServicePoint srvPoint, X509Certificate certificate,
                WebRequest request, int certificateProblem) {
                return true;
            }
        }
"@
    [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "`n? Пользователь успешно создан!" -ForegroundColor Green
    Write-Host "`nДанные пользователя:" -ForegroundColor Yellow
    Write-Host "Email: $($response.email)" -ForegroundColor Cyan
    Write-Host "Username: $($response.userName)" -ForegroundColor Cyan
    Write-Host "UserId: $($response.userId)" -ForegroundColor Cyan
    Write-Host "`nJWT Token:" -ForegroundColor Yellow
    Write-Host $response.token -ForegroundColor White

    Write-Host "`n?? Токен скопирован в буфер обмена!" -ForegroundColor Green
    Set-Clipboard -Value $response.token

} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__

        if ($statusCode -eq 400) {
            Write-Host "`n??  Пользователь уже существует!" -ForegroundColor Yellow
            Write-Host "Попробуем войти..." -ForegroundColor Cyan

            $loginData = @{
                email = "test@flashcards.com"
                password = "Test123!"
            } | ConvertTo-Json

            try {
                $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
                    -Method Post `
                    -Body $loginData `
                    -ContentType "application/json" `
                    -ErrorAction Stop

                Write-Host "`n? Вход выполнен успешно!" -ForegroundColor Green
                Write-Host "`nДанные пользователя:" -ForegroundColor Yellow
                Write-Host "Email: $($loginResponse.email)" -ForegroundColor Cyan
                Write-Host "Username: $($loginResponse.userName)" -ForegroundColor Cyan
                Write-Host "UserId: $($loginResponse.userId)" -ForegroundColor Cyan
                Write-Host "`nJWT Token:" -ForegroundColor Yellow
                Write-Host $loginResponse.token -ForegroundColor White

                Write-Host "`n?? Токен скопирован в буфер обмена!" -ForegroundColor Green
                Set-Clipboard -Value $loginResponse.token

            } catch {
                Write-Host "`n? Ошибка при входе: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "`n? Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n? Не удалось подключиться к API" -ForegroundColor Red
        Write-Host "Убедитесь, что приложение запущено на $baseUrl" -ForegroundColor Yellow
        Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nГотово! Нажмите любую клавишу для выхода..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
