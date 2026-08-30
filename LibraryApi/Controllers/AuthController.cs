using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LibraryDbContext _context;
private readonly IConfiguration _configuration;

public AuthController(
    LibraryDbContext context,
    IConfiguration configuration)
{
    _context = context;
    _configuration = configuration;
}


    // ============================================================
    // POST: api/Auth/register
    // REGISTER USER
    // ============================================================
    [HttpPost("register")]
public async Task<IActionResult> Register(RegisterDto dto)
{
    // ============================================================
    // VALIDATE FULL NAME
    // ============================================================

    if (string.IsNullOrWhiteSpace(dto.FullName))
    {
        return BadRequest("Full name is required.");
    }


    // ============================================================
    // VALIDATE ADMISSION NUMBER
    // ============================================================

    if (string.IsNullOrWhiteSpace(dto.AdmissionNumber))
    {
        return BadRequest("Admission number is required.");
    }


    // ============================================================
    // VALIDATE EMAIL
    // ============================================================

    if (string.IsNullOrWhiteSpace(dto.Email))
    {
        return BadRequest("Email is required.");
    }


    // ============================================================
    // CHECK EMAIL
    // ============================================================

    var existingUser = await _context.UserAccounts
        .FirstOrDefaultAsync(
            u => u.Email.ToLower() == dto.Email.Trim().ToLower()
        );

    if (existingUser != null)
    {
        return BadRequest(
            "An account with this email already exists."
        );
    }


    // ============================================================
    // FIND MEMBER USING ADMISSION NUMBER
    // ============================================================

    var member = await _context.Members
        .FirstOrDefaultAsync(
            m => m.AdmissionNumber.ToLower()
                == dto.AdmissionNumber.Trim().ToLower()
        );

    if (member == null)
    {
        return BadRequest(
            "No library member was found with this admission number."
        );
    }


    // ============================================================
    // CHECK MEMBER EMAIL
    // ============================================================

    if (!member.Email.Equals(
        dto.Email.Trim(),
        StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(
            "The email does not match the email registered for this member."
        );
    }


    // ============================================================
    // CHECK WHETHER MEMBER ALREADY HAS ACCOUNT
    // ============================================================

    var memberAccount = await _context.UserAccounts
        .FirstOrDefaultAsync(
            u => u.MemberId == member.MemberId
        );

    if (memberAccount != null)
    {
        return BadRequest(
            "This member already has a user account."
        );
    }


    // ============================================================
    // VALIDATE PASSWORD
    // ============================================================

    if (string.IsNullOrWhiteSpace(dto.Password))
    {
        return BadRequest("Password is required.");
    }

    if (dto.Password.Length < 6)
    {
        return BadRequest(
            "Password must contain at least 6 characters."
        );
    }


    // ============================================================
    // CREATE USER ACCOUNT
    // ============================================================

    var user = new UserAccount
    {
        Email = dto.Email.Trim(),
        PasswordHash = HashPassword(dto.Password),
        Role = "User",
        MemberId = member.MemberId
    };


    _context.UserAccounts.Add(user);

    await _context.SaveChangesAsync();


    // ============================================================
    // RESPONSE
    // ============================================================

    return Ok(new
    {
        message = "Account created successfully.",
        user.UserId,
        user.Email,
        user.Role,
        user.MemberId
    });
}
    // ============================================================
    // POST: api/Auth/login
    // LOGIN USER
    // ============================================================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // --------------------------------------------------------
        // Validate email
        // --------------------------------------------------------
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("Email is required.");
        }


        // --------------------------------------------------------
        // Validate password
        // --------------------------------------------------------
        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Password is required.");
        }


        // --------------------------------------------------------
        // Find user by email
        // --------------------------------------------------------
        var user = await _context.UserAccounts
            .FirstOrDefaultAsync(
                u => u.Email.ToLower() == dto.Email.Trim().ToLower()
            );


        // --------------------------------------------------------
        // User does not exist
        // --------------------------------------------------------
        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }


        // --------------------------------------------------------
        // Verify password
        // --------------------------------------------------------
        bool passwordValid = VerifyPassword(
            dto.Password,
            user.PasswordHash
        );


        if (!passwordValid)
        {
            return Unauthorized("Invalid email or password.");
        }


        // --------------------------------------------------------
// Generate JWT
// --------------------------------------------------------
var token = GenerateJwtToken(user);

// --------------------------------------------------------
// Login successful
//
// NEVER return PasswordHash.
// --------------------------------------------------------
return Ok(new
{
    message = "Login successful.",

    token,

    user.UserId,
    user.Email,
    user.Role,
    user.MemberId
});
    }

// ============================================================
// GET: api/Auth/me
// TEST JWT AUTHENTICATION
// ============================================================
[Authorize]
[HttpGet("me")]
public IActionResult GetCurrentUser()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = User.FindFirstValue(ClaimTypes.Email);
    var role = User.FindFirstValue(ClaimTypes.Role);
    var memberId = User.FindFirstValue("MemberId");

    return Ok(new
    {
        message = "JWT is valid. User is authenticated.",
        userId,
        email,
        role,
        memberId
    });
}
// ============================================================
// GET: api/Auth/admin-test
// TEST ADMIN AUTHORIZATION
// ============================================================
[Authorize(Roles = "Admin")]
[HttpGet("admin-test")]
public IActionResult AdminTest()
{
    return Ok(new
    {
        message = "Admin authorization successful.",
        role = User.FindFirstValue(ClaimTypes.Role)
    });
}
// ============================================================
// POST: api/Auth/create-admin
// CREATE ADMIN ACCOUNT FOR TESTING
// ============================================================
[HttpPost("create-admin")]
public async Task<IActionResult> CreateAdmin()
{
    const string email = "admin@library.com";
    const string password = "admin123";

    // Check whether admin already exists
    var existingAdmin = await _context.UserAccounts
        .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    if (existingAdmin != null)
    {
        return BadRequest("Admin account already exists.");
    }

    // Create admin account
    var admin = new UserAccount
    {
        Email = email,
        PasswordHash = HashPassword(password),
        Role = "Admin",
        MemberId = null
    };

    _context.UserAccounts.Add(admin);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Admin account created successfully.",
        admin.UserId,
        admin.Email,
        admin.Role
    });
}
    // ============================================================
    // PASSWORD HASHING
    // ============================================================

    private static string HashPassword(string password)
    {
        // --------------------------------------------------------
        // Generate a random 16-byte salt
        // --------------------------------------------------------
        byte[] salt = RandomNumberGenerator.GetBytes(16);


        // --------------------------------------------------------
        // Generate password hash using PBKDF2
        // --------------------------------------------------------
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            100000,
            HashAlgorithmName.SHA256,
            32
        );


        // --------------------------------------------------------
        // Store:
        //
        // salt.hash
        //
        // Example:
        // "abc123...==.xyz456...=="
        // --------------------------------------------------------
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }


    // ============================================================
    // VERIFY PASSWORD
    // ============================================================

    private static bool VerifyPassword(
        string password,
        string storedPasswordHash)
    {
        try
        {
            // ----------------------------------------------------
            // Split stored value into:
            //
            // salt
            // hash
            // ----------------------------------------------------
            string[] parts = storedPasswordHash.Split('.');


            // ----------------------------------------------------
            // Make sure stored password has correct format
            // ----------------------------------------------------
            if (parts.Length != 2)
            {
                return false;
            }


            // ----------------------------------------------------
            // Convert Base64 salt and stored hash back to bytes
            // ----------------------------------------------------
            byte[] salt = Convert.FromBase64String(parts[0]);

            byte[] storedHash =
                Convert.FromBase64String(parts[1]);


            // ----------------------------------------------------
            // Hash the password entered during login
            // using the SAME salt and settings used during
            // registration.
            // ----------------------------------------------------
            byte[] enteredPasswordHash =
                Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    100000,
                    HashAlgorithmName.SHA256,
                    32
                );


            // ----------------------------------------------------
            // Compare hashes securely
            // ----------------------------------------------------
            return CryptographicOperations.FixedTimeEquals(
                enteredPasswordHash,
                storedHash
            );
        }
        catch
        {
            // If stored password hash is invalid,
            // treat it as an incorrect password.
            return false;
        }
    }
    // ============================================================
// GENERATE JWT TOKEN
// ============================================================

private string GenerateJwtToken(UserAccount user)
{
    var jwtKey = _configuration["Jwt:Key"];

    if (string.IsNullOrWhiteSpace(jwtKey))
    {
        throw new InvalidOperationException(
            "JWT key is not configured."
        );
    }

    var claims = new List<Claim>
    {
        new Claim(
            ClaimTypes.NameIdentifier,
            user.UserId.ToString()
        ),

        new Claim(
            ClaimTypes.Email,
            user.Email
        ),

        new Claim(
            ClaimTypes.Role,
            user.Role
        )
    };

    // Add MemberId only when the account is linked
    // to a member.
    if (user.MemberId.HasValue)
    {
        claims.Add(
            new Claim(
                "MemberId",
                user.MemberId.Value.ToString()
            )
        );
    }

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(jwtKey)
    );

    var credentials = new SigningCredentials(
        key,
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        claims: claims,

        expires: DateTime.UtcNow.AddHours(1),

        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler()
        .WriteToken(token);
}
}