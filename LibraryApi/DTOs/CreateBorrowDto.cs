namespace LibraryApi.DTOs;

public class CreateBorrowDto
{
    public int BookId { get; set; }

    public int MemberId { get; set; }

    public DateTime BorrowDate { get; set; }

    public DateTime DueDate { get; set; }
}