using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using LibraryApi.Data;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SERVICES
// ============================================================

builder.Services.AddControllers();

// ============================================================
// CORS
// ============================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ============================================================
// DATABASE
// ============================================================

builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// ============================================================
// JWT AUTHENTICATION
// ============================================================

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException(
        "JWT key is not configured."
    );
}

Console.WriteLine(
    "JWT KEY LOADED: " + !string.IsNullOrEmpty(jwtKey)
);

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        ),

        ValidateIssuer = false,
        ValidateAudience = false,

        ValidateLifetime = true,

        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine(
                "JWT AUTHENTICATION FAILED: " +
                context.Exception.Message
            );

            return Task.CompletedTask;
        },

        OnTokenValidated = context =>
        {
            Console.WriteLine(
                "JWT TOKEN VALIDATED SUCCESSFULLY"
            );

            return Task.CompletedTask;
        }
    };
});

// ============================================================
// AUTHORIZATION
// ============================================================

builder.Services.AddAuthorization();

// ============================================================
// OPENAPI
// ============================================================

builder.Services.AddOpenApi();

// ============================================================
// APPLICATION
// ============================================================

var app = builder.Build();

// ============================================================
// APPLY DATABASE MIGRATIONS
// ============================================================

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<LibraryDbContext>();

    try
    {
        Console.WriteLine("Checking database migrations...");

        db.Database.Migrate();

        Console.WriteLine("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "DATABASE MIGRATION FAILED: " + ex.Message
        );

        throw;
    }
}

// ============================================================
// OPENAPI
// ============================================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// ============================================================
// MIDDLEWARE
// ============================================================

app.UseCors("AllowFrontend");

// app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();