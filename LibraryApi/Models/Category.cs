namespace LibraryApi.Models;

public class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // Navigation Property
    public ICollection<Book> Books { get; set; } = new List<Book>();
}