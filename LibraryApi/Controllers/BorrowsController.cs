using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

    // =========================================================
    // POST: api/Borrows
    // BORROW BOOK
    //
    // User  -> Can borrow only for their own MemberId
    // Admin -> Can borrow for any MemberId
    // =========================================================
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> BorrowBook(CreateBorrowDto dto)
    {
        var isAdmin = User.IsInRole("Admin");

        int memberId;

        // =====================================================
        // GET MEMBER ID
        // =====================================================

        if (isAdmin)
        {
            // Admin can choose any member
            memberId = dto.MemberId;
        }
        else
        {
            // Normal User must use MemberId from JWT
            var memberIdClaim =
                User.FindFirstValue("MemberId");

            if (!int.TryParse(memberIdClaim, out memberId))
            {
                return Unauthorized(
                    "Member ID not found in user token."
                );
            }

            // Any MemberId sent by the user is ignored.
            // The MemberId from JWT is always used.
        }


        // =====================================================
        // FIND BOOK
        // =====================================================

        var book = await _context.Books
            .FindAsync(dto.BookId);

        if (book == null)
        {
            return BadRequest(
                "Book not found."
            );
        }


        // =====================================================
        // FIND MEMBER
        // =====================================================

        var member = await _context.Members
            .FindAsync(memberId);

        if (member == null)
        {
            return BadRequest(
                "Member not found."
            );
        }


        // =====================================================
        // CHECK MEMBER ACTIVE
        // =====================================================

        if (!member.IsActive)
        {
            return BadRequest(
                "Member is not active."
            );
        }


        // =====================================================
        // CHECK 1
        // SAME MEMBER + SAME BOOK
        //
        // A member cannot borrow the same book again
        // while the previous borrowing is still active.
        // =====================================================

        var alreadyBorrowed = await _context.Borrows
            .AnyAsync(b =>
                b.MemberId == memberId &&
                b.BookId == dto.BookId &&
                b.ReturnDate == null
            );

        if (alreadyBorrowed)
        {
            return BadRequest(
                "This member has already borrowed this book and has not returned it yet."
            );
        }


        // =====================================================
        // CHECK 2
        // MAXIMUM ACTIVE BORROWING LIMIT
        //
        // A member can have maximum 3 books at a time.
        // Returned books are NOT counted.
        // =====================================================

        const int maxBorrowedBooks = 3;

        var currentBorrowedCount =
            await _context.Borrows
                .CountAsync(b =>
                    b.MemberId == memberId &&
                    b.ReturnDate == null
                );

        if (currentBorrowedCount >= maxBorrowedBooks)
        {
            return BadRequest(
                $"This member has already reached the maximum borrowing limit of {maxBorrowedBooks} books."
            );
        }


        // =====================================================
        // CHECK BOOK AVAILABILITY
        // =====================================================

        if (book.AvailableCopies <= 0)
        {
            return BadRequest(
                "Book is currently unavailable."
            );
        }


        // =====================================================
        // CHECK DATES
        // =====================================================

        if (dto.DueDate.Date < dto.BorrowDate.Date)
        {
            return BadRequest(
                "Due date cannot be before borrow date."
            );
        }


        // =====================================================
        // CREATE BORROW RECORD
        // =====================================================

        var borrow = new Borrow
        {
            BookId = dto.BookId,

            MemberId = memberId,

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


        // =====================================================
        // DECREASE AVAILABLE COPIES
        // =====================================================

        book.AvailableCopies--;


        // =====================================================
        // SAVE BORROW
        // =====================================================

        _context.Borrows.Add(borrow);

        await _context.SaveChangesAsync();


        // =====================================================
        // RESPONSE
        // =====================================================

        return Ok(new
        {
            borrow.BorrowId,

            Book = book.Title,

            Member = member.FullName,

            borrow.BorrowDate,

            borrow.DueDate,

            borrow.Status,

            RemainingCopies =
                book.AvailableCopies,

            ActiveBorrowedBooks =
                currentBorrowedCount + 1,

            MaximumBorrowedBooks =
                maxBorrowedBooks
        });
    }


    // =========================================================
    // POST: api/Borrows/return
    // RETURN BOOK
    //
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpPost("return")]
    public async Task<IActionResult> ReturnBook(
        ReturnBookDto dto)
    {
        var borrow = await _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .FirstOrDefaultAsync(
                b => b.BorrowId == dto.BorrowId
            );

        if (borrow == null)
        {
            return NotFound(
                "Borrow record not found."
            );
        }


        // =====================================================
        // CHECK ALREADY RETURNED
        // =====================================================

        if (borrow.Status == "Returned")
        {
            return BadRequest(
                "This book has already been returned."
            );
        }


        // =====================================================
        // CHECK BOOK
        // =====================================================

        if (borrow.Book == null)
        {
            return BadRequest(
                "Book information not found."
            );
        }


        // =====================================================
        // CHECK MEMBER
        // =====================================================

        if (borrow.Member == null)
        {
            return BadRequest(
                "Member information not found."
            );
        }


        // =====================================================
        // CHECK RETURN DATE
        // =====================================================

        if (dto.ReturnDate.Date < borrow.BorrowDate.Date)
        {
            return BadRequest(
                "Return date cannot be before borrow date."
            );
        }


        // =====================================================
        // UPDATE BORROW
        // =====================================================

        borrow.ReturnDate =
            DateTime.SpecifyKind(
                dto.ReturnDate,
                DateTimeKind.Utc
            );

        borrow.Status = "Returned";


        // =====================================================
        // INCREASE AVAILABLE COPIES
        // =====================================================

        borrow.Book.AvailableCopies++;


        // =====================================================
        // SAVE
        // =====================================================

        await _context.SaveChangesAsync();


        return Ok(new
        {
            borrow.BorrowId,

            Book =
                borrow.Book.Title,

            Member =
                borrow.Member.FullName,

            borrow.ReturnDate,

            borrow.Status,

            AvailableCopies =
                borrow.Book.AvailableCopies,

            Message =
                "Book returned successfully."
        });
    }


    // =========================================================
    // GET: api/Borrows
    // GET ALL BORROW RECORDS
    //
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllBorrows()
    {
        var borrows = await _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .Select(b => new BorrowResponseDto
            {
                BorrowId = b.BorrowId,

                BookTitle =
                    b.Book!.Title,

                MemberName =
                    b.Member!.FullName,

                BorrowDate =
                    b.BorrowDate,

                DueDate =
                    b.DueDate,

                ReturnDate =
                    b.ReturnDate,

                Status =
                    b.ReturnDate == null
                        ? "Borrowed"
                        : "Returned"
            })
            .ToListAsync();

        return Ok(borrows);
    }


    // =========================================================
    // GET: api/Borrows/my
    // GET CURRENT USER'S BORROWING HISTORY
    //
    // User only
    // =========================================================
    [Authorize(Roles = "User")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBorrows()
    {
        var memberIdClaim =
            User.FindFirstValue("MemberId");

        if (!int.TryParse(
                memberIdClaim,
                out int memberId))
        {
            return Unauthorized(
                "Member ID not found in user token."
            );
        }


        var borrows = await _context.Borrows
            .Include(b => b.Book)
            .Include(b => b.Member)
            .Where(b =>
                b.MemberId == memberId)
            .Select(b => new BorrowResponseDto
            {
                BorrowId =
                    b.BorrowId,

                BookTitle =
                    b.Book!.Title,

                MemberName =
                    b.Member!.FullName,

                BorrowDate =
                    b.BorrowDate,

                DueDate =
                    b.DueDate,

                ReturnDate =
                    b.ReturnDate,

                Status =
                    b.ReturnDate == null
                        ? "Borrowed"
                        : "Returned"
            })
            .ToListAsync();

        return Ok(borrows);
    }


    // =========================================================
    // GET: api/Borrows/overdue
    // GET OVERDUE BOOKS
    //
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdueBooks()
    {
        var today =
            DateTime.UtcNow.Date;

        var overdueBooks =
            await _context.Borrows
                .Include(b => b.Book)
                .Include(b => b.Member)
                .Where(b =>
                    b.DueDate.Date < today &&
                    b.ReturnDate == null)
                .Select(b => new
                {
                    b.BorrowId,

                    BookTitle =
                        b.Book!.Title,

                    MemberName =
                        b.Member!.FullName,

                    b.DueDate,

                    DaysLate =
                        (today -
                         b.DueDate.Date).Days
                })
                .ToListAsync();


        if (!overdueBooks.Any())
        {
            return NotFound(
                "No overdue books found."
            );
        }

        return Ok(overdueBooks);
    }


    // =========================================================
    // GET: api/Borrows/search
    // SEARCH BORROW RECORDS
    //
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
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


        // =====================================================
        // SEARCH MEMBER NAME
        // =====================================================

        if (!string.IsNullOrWhiteSpace(memberName))
        {
            query = query.Where(b =>
                b.Member!.FullName
                    .ToLower()
                    .Contains(
                        memberName.ToLower()
                    )
            );
        }


        // =====================================================
        // SEARCH ADMISSION NUMBER
        // =====================================================

        if (!string.IsNullOrWhiteSpace(
                admissionNumber))
        {
            query = query.Where(b =>
                b.Member!.AdmissionNumber
                    .ToLower()
                    .Contains(
                        admissionNumber.ToLower()
                    )
            );
        }


        // =====================================================
        // SEARCH BOOK TITLE
        // =====================================================

        if (!string.IsNullOrWhiteSpace(bookTitle))
        {
            query = query.Where(b =>
                b.Book!.Title
                    .ToLower()
                    .Contains(
                        bookTitle.ToLower()
                    )
            );
        }


        // =====================================================
        // CREATE RESULT
        // =====================================================

        var results = await query
            .Select(b => new
            {
                b.BorrowId,

                BookTitle =
                    b.Book!.Title,

                MemberName =
                    b.Member!.FullName,

                AdmissionNumber =
                    b.Member.AdmissionNumber,

                b.BorrowDate,

                b.DueDate,

                b.ReturnDate,

                Status =
                    b.ReturnDate == null
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