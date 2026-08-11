namespace LibraryApi.DTOs;

public class AuthorDto
{
    public int AuthorId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}