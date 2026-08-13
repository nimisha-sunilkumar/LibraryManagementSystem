using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowsController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public BorrowsController(LibraryDbContext context)
    {
        _context = context;
    }

    // =========================
    // POST: api/Borrows
    // BORROW BOOK
    // =========================
    [HttpPost]
    public async Task<IActionResult> BorrowBook(CreateBorrowDto dto)
    {
        var book = await _context.Books.FindAsync(dto.BookId);

        if (book == null)
            return BadRequest("Book not found.");

        var member = await _context.Members.FindAsync(dto.MemberId);

        if (member == null)
            return BadRequest("Member not found.");

        if (!member.IsActive)
            return BadRequest("Member is not active.");

        if (book.AvailableCopies <= 0)
            return BadRequest("Book is currently unavailable.");

        if (dto.DueDate.Date < dto.BorrowDate.Date)
            return BadRequest("Due date cannot be before borrow date.");

        var borrow = new Borrow
        {
            BookId = dto.BookId,
            MemberId = dto.MemberId,

            BorrowDate = DateTime.SpecifyKind(
                dto.BorrowDate,
                DateTimeKind.Utc
            ),

            DueDate = DateTime.SpecifyKind(
                dto.DueDate,
                DateTimeKind.Utc
            ),

            Status = "Borrowed"
        };

        // Decrease available copies
        book.AvailableCopies--;

        _context.Borrows.Add(borrow);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            borrow.BorrowId,
            Book = book.Title,
            Member = member.FullName,
            borrow.BorrowDate,
            borrow.DueDate,
            borrow.Status,
            RemainingCopies = book.AvailableCopies
        });
    }


    // =========================
    // POST: api/Borrows/return
    // RETURN BOOK
    // =========================
    [HttpPost("return")]
    public async Task<IActionResult> ReturnBook(ReturnBookDto dto)
    {
        var borrow = await _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .FirstOrDefaultAsync(
                b => b.BorrowId == dto.BorrowId
            );

        if (borrow == null)
        {
            return NotFound("Borrow record not found.");
        }

        if (borrow.Status == "Returned")
        {
            return BadRequest(
                "This book has already been returned."
            );
        }

        if (borrow.Book == null)
        {
            return BadRequest("Book information not found.");
        }

        if (borrow.Member == null)
        {
            return BadRequest("Member information not found.");
        }

        borrow.ReturnDate = DateTime.SpecifyKind(
            dto.ReturnDate,
            DateTimeKind.Utc
        );

        borrow.Status = "Returned";

        // Increase available copies
        borrow.Book.AvailableCopies++;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            borrow.BorrowId,
            Book = borrow.Book.Title,
            Member = borrow.Member.FullName,
            borrow.ReturnDate,
            borrow.Status,
            AvailableCopies = borrow.Book.AvailableCopies,
            Message = "Book returned successfully."
        });
    }


    // =========================
    // GET: api/Borrows
    // GET ALL BORROW RECORDS
    // =========================
    [HttpGet]
    public async Task<IActionResult> GetAllBorrows()
    {
        var borrows = await _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .Select(b => new BorrowResponseDto
            {
                BorrowId = b.BorrowId,

                BookTitle = b.Book!.Title,

                MemberName = b.Member!.FullName,

                BorrowDate = b.BorrowDate,

                DueDate = b.DueDate,

                ReturnDate = b.ReturnDate,

                Status = b.ReturnDate == null
                    ? "Borrowed"
                    : "Returned"
            })
            .ToListAsync();

        return Ok(borrows);
    }


    // =========================
    // GET: api/Borrows/overdue
[HttpGet("overdue")]
public async Task<IActionResult> GetOverdueBooks()
{
    var today = DateTime.UtcNow.Date;

    var overdueBooks = await _context.Borrows
        .Include(b => b.Book)
        .Include(b => b.Member)
        .Where(b =>
            b.DueDate.Date < today &&
            b.ReturnDate == null)
        .Select(b => new
        {
            b.BorrowId,
            BookTitle = b.Book!.Title,
            MemberName = b.Member!.FullName,
            b.DueDate,
            DaysLate = (today - b.DueDate.Date).Days
        })
        .ToListAsync();

    if (!overdueBooks.Any())
    {
        return NotFound("No overdue books found.");
    }

    return Ok(overdueBooks);
}

    // =========================
    // GET: api/Borrows/search
    // SEARCH BORROW RECORDS
    // =========================
    [HttpGet("search")]
    public async Task<IActionResult> SearchBorrows(
        string? memberName,
        string? admissionNumber,
        string? bookTitle)
    {
        var query = _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(memberName))
        {
            query = query.Where(b =>
                b.Member!.FullName
                    .ToLower()
                    .Contains(memberName.ToLower())
            );
        }

        if (!string.IsNullOrWhiteSpace(admissionNumber))
        {
            query = query.Where(b =>
                b.Member!.AdmissionNumber
                    .ToLower()
                    .Contains(admissionNumber.ToLower())
            );
        }

        if (!string.IsNullOrWhiteSpace(bookTitle))
        {
            query = query.Where(b =>
                b.Book!.Title
                    .ToLower()
                    .Contains(bookTitle.ToLower())
            );
        }

        var results = await query
            .Select(b => new
            {
                b.BorrowId,

                BookTitle = b.Book!.Title,

                MemberName = b.Member!.FullName,

                AdmissionNumber =
                    b.Member.AdmissionNumber,

                b.BorrowDate,

                b.DueDate,

                b.ReturnDate,

                Status = b.ReturnDate == null
                    ? "Borrowed"
                    : "Returned"
            })
            .ToListAsync();

        if (!results.Any())
        {
            return NotFound(
                "No borrowing records found."
            );
        }

        return Ok(results);
    }
}