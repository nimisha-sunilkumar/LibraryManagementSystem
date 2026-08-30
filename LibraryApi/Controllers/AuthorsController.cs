using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public AuthorsController(LibraryDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // POST: api/Authors
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateAuthor(CreateAuthorDto dto)
    {
        var author = new Author
        {
            Name = dto.Name,
            Email = dto.Email
        };

        _context.Authors.Add(author);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAuthorById),
            new { id = author.AuthorId },
            author
        );
    }

    // =========================================================
    // GET: api/Authors
    // Public
    // =========================================================
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllAuthors()
    {
        var authors = await _context.Authors
            .Select(a => new AuthorDto
            {
                AuthorId = a.AuthorId,
                Name = a.Name,
                Email = a.Email
            })
            .ToListAsync();

        return Ok(authors);
    }

    // =========================================================
    // GET: api/Authors/{id}
    // Public
    // =========================================================
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuthorById(int id)
    {
        var author = await _context.Authors
            .Where(a => a.AuthorId == id)
            .Select(a => new
            {
                AuthorId = a.AuthorId,
                Name = a.Name,
                Email = a.Email,

                Books = a.BookAuthors
                    .Select(ba => new
                    {
                        BookId = ba.Book.BookId,
                        Title = ba.Book.Title,
                        ISBN = ba.Book.ISBN,
                        Description = ba.Book.Description,

                        PublishedDate =
                            DateOnly.FromDateTime(
                                ba.Book.PublishedDate
                            ),

                        TotalCopies = ba.Book.TotalCopies,
                        AvailableCopies = ba.Book.AvailableCopies,

                        CategoryId = ba.Book.CategoryId,

                        CategoryName =
                            ba.Book.Category != null
                                ? ba.Book.Category.CategoryName
                                : null
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (author == null)
        {
            return NotFound("Author not found");
        }

        return Ok(author);
    }

    // =========================================================
    // PUT: api/Authors/{id}
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAuthor(
        int id,
        UpdateAuthorDto dto)
    {
        var author = await _context.Authors.FindAsync(id);

        if (author == null)
        {
            return NotFound("Author not found");
        }

        author.Name = dto.Name;
        author.Email = dto.Email;

        await _context.SaveChangesAsync();

        return Ok(author);
    }

    // =========================================================
    // DELETE: api/Authors/{id}
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAuthor(int id)
    {
        var author = await _context.Authors.FindAsync(id);

        if (author == null)
        {
            return NotFound("Author not found");
        }

        _context.Authors.Remove(author);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}