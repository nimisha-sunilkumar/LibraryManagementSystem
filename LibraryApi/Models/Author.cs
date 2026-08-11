namespace LibraryApi.Models;

public class Author
{
    public int AuthorId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Add this
    public ICollection<BookAuthor> BookAuthors { get; set; }
        = new List<BookAuthor>();
}