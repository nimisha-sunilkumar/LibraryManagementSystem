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
    public IActionResult CreateAuthor(CreateAuthorDto dto)
    {
        var author = new Author
        {
            Name = dto.Name,
            Email = dto.Email
        };

        _context.Authors.Add(author);
        _context.SaveChanges();

        return Ok(author);
    }

    // GET: api/Authors
    [HttpGet]
    public async Task<IActionResult> GetAllAuthors()
    {
        var authors = await _context.Authors.ToListAsync();

        return Ok(authors);
    }

    // GET: api/Authors/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuthorById(int id)
    {
        var author = await _context.Authors.FindAsync(id);

        if (author == null)
        {
            return NotFound("Author not found");
        }

        return Ok(author);
    }

    // PUT: api/Authors/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAuthor(int id, CreateAuthorDto dto)
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
