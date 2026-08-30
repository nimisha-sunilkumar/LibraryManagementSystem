namespace LibraryApi.DTOs;

public class CreateBookDto
{
    public string Title { get; set; } = string.Empty;

    public string ISBN { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime PublishedDate { get; set; }

    public string CoverUrl { get; set; } = string.Empty;

    public int TotalCopies { get; set; }

    public int CategoryId { get; set; }

    public int AuthorId { get; set; }
}