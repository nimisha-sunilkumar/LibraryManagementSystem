namespace LibraryApi.Models;

public class Borrow
{
    public int BorrowId { get; set; }

    // Foreign Key -> Member
    public int MemberId { get; set; }
    public Member? Member { get; set; }

    // Foreign Key -> Book
    public int BookId { get; set; }
    public Book? Book { get; set; }

    // Borrow Details
    public DateTime BorrowDate { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    public string Status { get; set; } = "Issued";
}