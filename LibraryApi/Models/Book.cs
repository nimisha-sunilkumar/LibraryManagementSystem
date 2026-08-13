namespace LibraryApi.Models;

public class Book
{
    public int BookId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ISBN { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime PublishedDate { get; set; }

    public int TotalCopies { get; set; }

    public int AvailableCopies { get; set; }

    public int CategoryId { get; set; }

    public Category? Category { get; set; }

    // Navigation Property
    public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();

    public ICollection<Borrow> Borrows { get; set; } = new List<Borrow>();
}