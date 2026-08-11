using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookAuthorsController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public BookAuthorsController(LibraryDbContext context)
    {
        _context = context;
    }

    // POST: api/BookAuthors
    [HttpPost]
    public async Task<IActionResult> CreateBookAuthor(CreateBookAuthorDto dto)
    {
        var book = await _context.Books.FindAsync(dto.BookId);
        var author = await _context.Authors.FindAsync(dto.AuthorId);

        if (book == null || author == null)
        {
            return BadRequest("Book or Author not found.");
        }

        bool alreadyExists = await _context.BookAuthors.AnyAsync(ba =>
            ba.BookId == dto.BookId &&
            ba.AuthorId == dto.AuthorId);

        if (alreadyExists)
        {
            return BadRequest("This author is already linked to this book.");
        }

        var bookAuthor = new BookAuthor
        {
            BookId = dto.BookId,
            AuthorId = dto.AuthorId
        };

        _context.BookAuthors.Add(bookAuthor);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            bookAuthor.BookId,
            BookTitle = book.Title,
            bookAuthor.AuthorId,
            AuthorName = author.Name,
            Message = "Book linked successfully."
        });
    }

    // GET: api/BookAuthors
    [HttpGet]
    public async Task<IActionResult> GetAllBookAuthors()
    {
        var result = await _context.BookAuthors
            .Include(ba => ba.Book)
            .Include(ba => ba.Author)
            .Select(ba => new BookAuthorResponseDto
            {
                BookId = ba.BookId,
                BookTitle = ba.Book.Title,
                AuthorId = ba.AuthorId,
                AuthorName = ba.Author.Name
            })
            .ToListAsync();

        return Ok(result);
    }
}