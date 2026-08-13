using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
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

    // POST: api/Authors
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

        return Ok(author);
    }

    // GET: api/Authors
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

    // GET: api/Authors/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuthorById(int id)
    {
        var author = await _context.Authors
            .Where(a => a.AuthorId == id)
            .Select(a => new AuthorDto
            {
                AuthorId = a.AuthorId,
                Name = a.Name,
                Email = a.Email
            })
            .FirstOrDefaultAsync();

        if (author == null)
        {
            return NotFound("Author not found");
        }

        return Ok(author);
    }

    // PUT: api/Authors/1
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

    // DELETE: api/Authors/1
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

        return Ok("Author deleted successfully");
    }
}