namespace LibraryApi.Models;

public class Member
{
    public int MemberId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string AdmissionNumber { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Semester { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public DateTime JoinedDate { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Borrow> Borrows { get; set; } = new List<Borrow>();
}