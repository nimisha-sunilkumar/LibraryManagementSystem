namespace LibraryApi.DTOs;

public class BookAuthorResponseDto
{
    public int BookId { get; set; }

    public string BookTitle { get; set; } = string.Empty;

    public int AuthorId { get; set; }

    public string AuthorName { get; set; } = string.Empty;
}