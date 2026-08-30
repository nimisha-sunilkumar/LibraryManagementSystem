using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

    // ============================================================
    // POST: api/Books
    // CREATE BOOK
    // ============================================================
    [Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> CreateBook(CreateBookDto dto)
    {
        // Check author
        var author = await _context.Authors
            .FindAsync(dto.AuthorId);

        if (author == null)
        {
            return BadRequest("Author not found.");
        }

        // Check category
        var category = await _context.Categories
            .FindAsync(dto.CategoryId);

        if (category == null)
        {
            return BadRequest("Category not found.");
        }

        // Validate total copies
        if (dto.TotalCopies < 0)
        {
            return BadRequest(
                "Total copies cannot be negative."
            );
        }

        var book = new Book
        {
            Title = dto.Title,
            ISBN = dto.ISBN,
            Description = dto.Description,

            PublishedDate = DateTime.SpecifyKind(
                dto.PublishedDate,
                DateTimeKind.Utc
            ),

            // NEW: Book cover URL
            CoverUrl = dto.CoverUrl,

            TotalCopies = dto.TotalCopies,

            // Initially all copies are available
            AvailableCopies = dto.TotalCopies,

            CategoryId = dto.CategoryId
        };

        _context.Books.Add(book);

        await _context.SaveChangesAsync();

        // Create Book ↔ Author relationship
        var bookAuthor = new BookAuthor
        {
            BookId = book.BookId,
            AuthorId = dto.AuthorId
        };

        _context.BookAuthors.Add(bookAuthor);

        await _context.SaveChangesAsync();

        // Return safe response object
        // instead of EF entity to avoid circular JSON references.
        return Ok(new
        {
            book.BookId,
            book.Title,
            book.ISBN,
            book.Description,
            book.PublishedDate,

            // NEW
            book.CoverUrl,

            book.TotalCopies,
            book.AvailableCopies,
            book.CategoryId,
            AuthorId = dto.AuthorId
        });
    }


    // ============================================================
    // GET: api/Books
    // GET ALL BOOKS
    // ============================================================
    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await _context.Books
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .Select(b => new BookDto
            {
                BookId = b.BookId,
                Title = b.Title,
                ISBN = b.ISBN,
                Description = b.Description,

                PublishedDate = DateOnly.FromDateTime(
                    b.PublishedDate
                ),

                // NEW
                CoverUrl = b.CoverUrl,

                TotalCopies = b.TotalCopies,
                AvailableCopies = b.AvailableCopies,
                CategoryId = b.CategoryId,

                CategoryName = b.Category!.CategoryName,

                AuthorName = b.BookAuthors
                    .Select(ba => ba.Author.Name)
                    .FirstOrDefault() ?? "Unknown"
            })
            .ToListAsync();

        return Ok(books);
    }


    // ============================================================
// GET: api/Books/search?title=Clean
// SEARCH BOOKS BY TITLE
// ============================================================
[HttpGet("search")]
public async Task<IActionResult> SearchBooks(string title)
{
    var books = await _context.Books
        .Include(b => b.Category)
        .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
        .Where(b =>
            b.Title.ToLower()
                .Contains(title.ToLower())
        )
        .Select(b => new
        {
            b.BookId,
            b.Title,
            b.ISBN,

            b.Description,
            b.CoverUrl,

            Category = b.Category!.CategoryName,

            // Get author name
            AuthorName = b.BookAuthors
                .Select(ba => ba.Author!.Name)
                .FirstOrDefault() ?? "Unknown",

            b.AvailableCopies
        })
        .ToListAsync();

    return Ok(books);
}
// ============================================================
// GET: api/Books/category/{categoryName}
// SEARCH BOOKS BY CATEGORY
// PARTIAL CATEGORY NAME MATCH
// ============================================================
[HttpGet("category/{categoryName}")]
public async Task<IActionResult> SearchBooksByCategory(
    string categoryName)
{
    if (string.IsNullOrWhiteSpace(categoryName))
    {
        return BadRequest("Category name is required.");
    }

    categoryName = categoryName.Trim();

    var books = await _context.Books
        .Include(b => b.Category)
        .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
        .Where(b =>
            b.Category != null &&
            b.Category.CategoryName.ToLower()
                .Contains(categoryName.ToLower())
        )
        .Select(b => new BookDto
        {
            BookId = b.BookId,
            Title = b.Title,
            ISBN = b.ISBN,
            Description = b.Description,

            PublishedDate = DateOnly.FromDateTime(
                b.PublishedDate
            ),

            CoverUrl = b.CoverUrl,

            TotalCopies = b.TotalCopies,
            AvailableCopies = b.AvailableCopies,

            CategoryId = b.CategoryId,

            CategoryName = b.Category!.CategoryName,

            AuthorName = b.BookAuthors
                .Select(ba => ba.Author!.Name)
                .FirstOrDefault() ?? "Unknown"
        })
        .ToListAsync();

    if (!books.Any())
    {
        return NotFound(
            "No books found in this category."
        );
    }

    return Ok(books);
}
    // ============================================================
// GET: api/Books/author/{authorName}
// SEARCH BOOKS BY AUTHOR
// PARTIAL AUTHOR NAME MATCH
// ============================================================
[HttpGet("author/{authorName}")]
public async Task<IActionResult> SearchBooksByAuthor(
    string authorName)
{
    if (string.IsNullOrWhiteSpace(authorName))
    {
        return BadRequest("Author name is required.");
    }

    authorName = authorName.Trim();

    var books = await _context.BookAuthors
        .Include(ba => ba.Book)
            .ThenInclude(b => b.Category)
        .Include(ba => ba.Author)
        .Where(ba =>
            ba.Author != null &&
            ba.Author.Name.ToLower()
                .Contains(authorName.ToLower())
        )
        .Select(ba => new BookDto
        {
            BookId = ba.Book!.BookId,

            Title = ba.Book.Title,

            ISBN = ba.Book.ISBN,

            Description = ba.Book.Description,

            PublishedDate = DateOnly.FromDateTime(
                ba.Book.PublishedDate
            ),

            CoverUrl = ba.Book.CoverUrl,

            TotalCopies = ba.Book.TotalCopies,

            AvailableCopies = ba.Book.AvailableCopies,

            CategoryId = ba.Book.CategoryId,

            CategoryName = ba.Book.Category!.CategoryName,

            // FIXED: return the actual author name
            AuthorName = ba.Author!.Name
        })
        .Distinct()
        .ToListAsync();

    if (!books.Any())
    {
        return NotFound(
            "No books found for this author."
        );
    }

    return Ok(books);
}


    // ============================================================
    // GET: api/Books/{id}
    // GET BOOK BY ID
    // ============================================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await _context.Books
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(
                b => b.BookId == id
            );

        if (book == null)
        {
            return NotFound("Book not found");
        }

        var authorName = book.BookAuthors
            .Select(ba => ba.Author.Name)
            .FirstOrDefault() ?? "Unknown";

        var result = new BookDto
        {
            BookId = book.BookId,
            Title = book.Title,
            ISBN = book.ISBN,
            Description = book.Description,

            PublishedDate = DateOnly.FromDateTime(
                book.PublishedDate
            ),

            // NEW
            CoverUrl = book.CoverUrl,

            TotalCopies = book.TotalCopies,
            AvailableCopies = book.AvailableCopies,
            CategoryId = book.CategoryId,
            CategoryName = book.Category!.CategoryName,
            AuthorName = authorName
        };

        return Ok(result);
    }


    // ============================================================
    // PUT: api/Books/{id}
    // UPDATE BOOK
    // ============================================================
    [Authorize(Roles = "Admin")]
[HttpPut("{id}")]
public async Task<IActionResult> UpdateBook(
        int id,
        UpdateBookDto dto)
    {
        // --------------------------------------------------------
        // Find book
        // --------------------------------------------------------
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.BookId == id);

        if (book == null)
        {
            return NotFound("Book not found.");
        }


        // --------------------------------------------------------
        // Check author
        // --------------------------------------------------------
        var author = await _context.Authors
            .FindAsync(dto.AuthorId);

        if (author == null)
        {
            return BadRequest("Author not found.");
        }


        // --------------------------------------------------------
        // Check category
        // --------------------------------------------------------
        var category = await _context.Categories
            .FindAsync(dto.CategoryId);

        if (category == null)
        {
            return BadRequest("Category not found.");
        }


        // --------------------------------------------------------
        // Validate total copies
        // --------------------------------------------------------
        if (dto.TotalCopies < 0)
        {
            return BadRequest(
                "Total copies cannot be negative."
            );
        }


        // --------------------------------------------------------
        // Calculate currently borrowed copies
        //
        // borrowed = total - available
        // --------------------------------------------------------
        int borrowedCopies =
            book.TotalCopies - book.AvailableCopies;


        // --------------------------------------------------------
        // Do not allow total copies to become less than
        // currently borrowed copies
        // --------------------------------------------------------
        if (dto.TotalCopies < borrowedCopies)
        {
            return BadRequest(
                $"Cannot reduce total copies below " +
                $"{borrowedCopies}. " +
                $"There are currently " +
                $"{borrowedCopies} copies borrowed."
            );
        }


        // --------------------------------------------------------
        // Update normal book properties
        // --------------------------------------------------------
        book.Title = dto.Title;
        book.ISBN = dto.ISBN;
        book.Description = dto.Description;

        book.PublishedDate = DateTime.SpecifyKind(
            dto.PublishedDate,
            DateTimeKind.Utc
        );

        // NEW: Update cover URL
        book.CoverUrl = dto.CoverUrl;

        book.TotalCopies = dto.TotalCopies;

        // Keep borrowed copies unchanged
        // and calculate new available copies.
        book.AvailableCopies =
            dto.TotalCopies - borrowedCopies;

        book.CategoryId = dto.CategoryId;


        // --------------------------------------------------------
        // Find existing BookAuthor relationship
        // --------------------------------------------------------
        var existingBookAuthor = await _context.BookAuthors
            .FirstOrDefaultAsync(
                ba => ba.BookId == id
            );


        // --------------------------------------------------------
        // If there is an existing relationship and the author
        // is changing, delete the old relationship first.
        // --------------------------------------------------------
        if (existingBookAuthor != null)
        {
            if (existingBookAuthor.AuthorId != dto.AuthorId)
            {
                _context.BookAuthors.Remove(
                    existingBookAuthor
                );

                // IMPORTANT:
                // Save deletion before inserting the new
                // BookAuthor because BookAuthor has a
                // composite primary key.
                await _context.SaveChangesAsync();

                var newBookAuthor = new BookAuthor
                {
                    BookId = id,
                    AuthorId = dto.AuthorId
                };

                _context.BookAuthors.Add(newBookAuthor);
            }
        }
        else
        {
            // No relationship exists, so create one.
            var newBookAuthor = new BookAuthor
            {
                BookId = id,
                AuthorId = dto.AuthorId
            };

            _context.BookAuthors.Add(newBookAuthor);
        }


        // --------------------------------------------------------
        // Save book changes + new relationship
        // --------------------------------------------------------
        await _context.SaveChangesAsync();


        // --------------------------------------------------------
        // Return safe response object.
        //
        // Do NOT return the EF Book entity directly because
        // Book -> BookAuthors -> Book -> BookAuthors can create
        // a JSON object cycle.
        // --------------------------------------------------------
        return Ok(new
        {
            book.BookId,
            book.Title,
            book.ISBN,
            book.Description,
            book.PublishedDate,

            // NEW
            book.CoverUrl,

            book.TotalCopies,
            book.AvailableCopies,
            book.CategoryId,
            AuthorId = dto.AuthorId
        });
    }


    // ============================================================
    // DELETE: api/Books/{id}
    // DELETE BOOK
    // ============================================================
   [Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteBook(int id)
    {
        // --------------------------------------------------------
        // Find book
        // --------------------------------------------------------
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.BookId == id);

        if (book == null)
        {
            return NotFound("Book not found.");
        }


        // --------------------------------------------------------
        // Find BookAuthor relationships
        // --------------------------------------------------------
        var bookAuthors = await _context.BookAuthors
            .Where(ba => ba.BookId == id)
            .ToListAsync();


        // --------------------------------------------------------
        // Remove relationships first
        // --------------------------------------------------------
        if (bookAuthors.Any())
        {
            _context.BookAuthors.RemoveRange(
                bookAuthors
            );

            await _context.SaveChangesAsync();
        }


        // --------------------------------------------------------
        // Remove the book
        // --------------------------------------------------------
        _context.Books.Remove(book);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Book deleted successfully.",
            bookId = id
        });
    }
}