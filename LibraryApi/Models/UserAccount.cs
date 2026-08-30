namespace LibraryApi.Models;

public class UserAccount
{
    public int UserId { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User";

    // A normal user is connected to a library member.
    // Admin accounts can have no Member.
    public int? MemberId { get; set; }

    public Member? Member { get; set; }
}