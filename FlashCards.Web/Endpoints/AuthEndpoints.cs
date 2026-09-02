using FlashCards.Business.DTOs;
using FlashCards.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FlashCards.Web.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/auth")
                .WithTags("Authentication");

            group.MapPost("/register", Register)
                .WithName("Register")
                .Produces<AuthResponseDTO>(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status400BadRequest);

            group.MapPost("/login", Login)
                .WithName("Login")
                .Produces<AuthResponseDTO>(StatusCodes.Status200OK)
                .Produces<string>(StatusCodes.Status401Unauthorized);
        }

        private static async Task<IResult> Register(
            RegisterDTO registerDto,
            UserManager<User> userManager,
            IConfiguration configuration)
        {
            var existingUser = await userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                return Results.BadRequest("User with this email already exists");
            }

            var user = new User
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return Results.BadRequest(errors);
            }

            var token = GenerateJwtToken(user, configuration);

            return Results.Ok(new AuthResponseDTO
            {
                Token = token,
                Email = user.Email!,
                UserName = user.UserName!,
                UserId = user.Id
            });
        }

        private static async Task<IResult> Login(
            LoginDTO loginDto,
            UserManager<User> userManager,
            IConfiguration configuration)
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!isPasswordValid)
            {
                return Results.Unauthorized();
            }

            var token = GenerateJwtToken(user, configuration);

            return Results.Ok(new AuthResponseDTO
            {
                Token = token,
                Email = user.Email!,
                UserName = user.UserName!,
                UserId = user.Id
            });
        }

        private static string GenerateJwtToken(User user, IConfiguration configuration)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
            var issuer = jwtSettings["Issuer"] ?? "FlashCards";
            var audience = jwtSettings["Audience"] ?? "FlashCards";

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.UserName!)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
