namespace LibraryApi.DTOs;

public class BorrowResponseDto
{
    public int BorrowId { get; set; }

    public string BookTitle { get; set; } = string.Empty;

    public string MemberName { get; set; } = string.Empty;

    public DateTime BorrowDate { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    public string Status { get; set; } = string.Empty;
}