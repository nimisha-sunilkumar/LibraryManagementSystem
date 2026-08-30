namespace LibraryApi.DTOs;

public class BookDto
{
    public int BookId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ISBN { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateOnly PublishedDate { get; set; }

    public string CoverUrl { get; set; } = string.Empty;

    public int TotalCopies { get; set; }

    public int AvailableCopies { get; set; }

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string AuthorName { get; set; } = string.Empty;
}