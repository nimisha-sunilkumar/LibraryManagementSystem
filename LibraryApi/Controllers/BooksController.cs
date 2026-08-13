using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public BooksController(LibraryDbContext context)
    {
        _context = context;
    }

    // POST: api/Books
    [HttpPost]
public async Task<IActionResult> CreateBook(CreateBookDto dto)
{
    var book = new Book
    {
        Title = dto.Title,
        ISBN = dto.ISBN,
        Description = dto.Description,

        PublishedDate = DateTime.SpecifyKind(
            dto.PublishedDate,
            DateTimeKind.Utc
        ),

        TotalCopies = dto.TotalCopies,

        // Initially all copies are available
        AvailableCopies = dto.TotalCopies,

        CategoryId = dto.CategoryId
    };

    _context.Books.Add(book);

    await _context.SaveChangesAsync();

    return Ok(book);
}
    // GET: api/Books
    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await _context.Books
    .Include(b => b.Category)
    .Select(b => new BookDto
    {
        BookId = b.BookId,
        Title = b.Title,
        ISBN = b.ISBN,
        Description = b.Description,
        PublishedDate = DateOnly.FromDateTime(b.PublishedDate),
        TotalCopies = b.TotalCopies,
        AvailableCopies = b.AvailableCopies,
        CategoryId = b.CategoryId,
        CategoryName = b.Category!.CategoryName
    })
    .ToListAsync();

        return Ok(books);
    }

    // GET: api/Books/search?title=Clean
    [HttpGet("search")]
    public async Task<IActionResult> SearchBooks(string title)
    {
        var books = await _context.Books
            .Include(b => b.Category)
            .Where(b => b.Title.ToLower().Contains(title.ToLower()))
            .Select(b => new
            {
                b.BookId,
                b.Title,
                b.ISBN,
                Category = b.Category!.CategoryName,
                b.AvailableCopies
            })
            .ToListAsync();

        return Ok(books);
    }

    // GET: api/Books/category/Technology
    [HttpGet("category/{categoryName}")]
    public async Task<IActionResult> SearchBooksByCategory(string categoryName)
    {
        var books = await _context.Books
            .Include(b => b.Category)
            .Where(b => b.Category!.CategoryName.ToLower() == categoryName.ToLower())
            .Select(b => new BookDto
            {
                BookId = b.BookId,
                Title = b.Title,
                ISBN = b.ISBN,
                Description = b.Description,
                PublishedDate = DateOnly.FromDateTime(b.PublishedDate),
                TotalCopies = b.TotalCopies,
                AvailableCopies = b.AvailableCopies,
                CategoryId = b.CategoryId,
                CategoryName = b.Category!.CategoryName
            })
            .ToListAsync();

        if (!books.Any())
            return NotFound("No books found in this category.");

        return Ok(books);
    }

    // GET: api/Books/author/Robert C. Martin
    [HttpGet("author/{authorName}")]
    public async Task<IActionResult> SearchBooksByAuthor(string authorName)
    {
        var books = await _context.BookAuthors
            .Include(ba => ba.Book)
                .ThenInclude(b => b.Category)
            .Include(ba => ba.Author)
            .Where(ba => ba.Author!.Name.ToLower().Contains(authorName.ToLower()))
            .Select(ba => new BookDto
            {
                BookId = ba.Book!.BookId,
                Title = ba.Book.Title,
                ISBN = ba.Book.ISBN,
                Description = ba.Book.Description,
                PublishedDate = DateOnly.FromDateTime(ba.Book.PublishedDate),
                TotalCopies = ba.Book.TotalCopies,
                AvailableCopies = ba.Book.AvailableCopies,
                CategoryId = ba.Book.CategoryId,
                CategoryName = ba.Book.Category!.CategoryName
            })
            .Distinct()
            .ToListAsync();

        if (!books.Any())
            return NotFound("No books found for this author.");

        return Ok(books);
    }

    // GET: api/Books/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await _context.Books
    .Include(b => b.Category)
    .FirstOrDefaultAsync(b => b.BookId == id);

        if (book == null)
        {
            return NotFound("Book not found");
        }

        var result = new BookDto
        {
            BookId = book.BookId,
            Title = book.Title,
            ISBN = book.ISBN,
            Description = book.Description,
            PublishedDate = DateOnly.FromDateTime(book.PublishedDate),
            TotalCopies = book.TotalCopies,
            AvailableCopies = book.AvailableCopies,
            CategoryId = book.CategoryId,
            CategoryName = book.Category!.CategoryName
        };

        return Ok(result);
    }

    // PUT: api/Books/1
[HttpPut("{id}")]
public async Task<IActionResult> UpdateBook(int id, UpdateBookDto dto)
{
    var book = await _context.Books.FindAsync(id);

    if (book == null)
    {
        return NotFound("Book not found");
    }

    // Number of copies currently borrowed
    int borrowedCopies = book.TotalCopies - book.AvailableCopies;

    // New total cannot be less than the number already borrowed
    if (dto.TotalCopies < borrowedCopies)
    {
        return BadRequest(
            $"Cannot reduce total copies below {borrowedCopies}. " +
            $"There are currently {borrowedCopies} copies borrowed."
        );
    }

    book.Title = dto.Title;
    book.ISBN = dto.ISBN;
    book.Description = dto.Description;

    book.PublishedDate = DateTime.SpecifyKind(
        dto.PublishedDate,
        DateTimeKind.Utc
    );

    book.TotalCopies = dto.TotalCopies;

    // Recalculate available copies automatically
    book.AvailableCopies = dto.TotalCopies - borrowedCopies;

    book.CategoryId = dto.CategoryId;

    await _context.SaveChangesAsync();

    return Ok(book);
}

    // DELETE: api/Books/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
        {
            return NotFound("Book not found");
        }

        _context.Books.Remove(book);

        await _context.SaveChangesAsync();

        return Ok("Book deleted successfully");
    }
}