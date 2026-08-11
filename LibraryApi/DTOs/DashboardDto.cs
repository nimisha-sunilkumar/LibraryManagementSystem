namespace LibraryApi.DTOs;

public class DashboardDto
{
    public int TotalBooks { get; set; }

    public int TotalCopies { get; set; }

    public int TotalAuthors { get; set; }

    public int TotalCategories { get; set; }

    public int TotalMembers { get; set; }

    public int BooksBorrowed { get; set; }

    public int BooksAvailable { get; set; }
}