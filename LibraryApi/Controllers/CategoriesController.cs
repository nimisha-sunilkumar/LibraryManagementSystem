using LibraryApi.DTOs;
using LibraryApi.Data;
using LibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public CategoriesController(LibraryDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET: api/Categories
    // PUBLIC
    // ============================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    // ============================================================
    // GET: api/Categories/{id}
    // PUBLIC
    // ============================================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .Where(c => c.CategoryId == id)
            .Select(c => new
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,

                Books = c.Books
                    .Select(b => new
                    {
                        BookId = b.BookId,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        PublishedDate = b.PublishedDate,
                        TotalCopies = b.TotalCopies,
                        AvailableCopies = b.AvailableCopies,
                        CategoryId = b.CategoryId
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound("Category not found");
        }

        return Ok(category);
    }

    // ============================================================
    // POST: api/Categories
    // ADMIN ONLY
    // ============================================================
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(
        CreateCategoryDto dto)
    {
        var category = new Category
        {
            CategoryName = dto.CategoryName,
            Description = dto.Description
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.CategoryId },
            category);
    }

    // ============================================================
    // PUT: api/Categories/{id}
    // ADMIN ONLY
    // ============================================================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        Category category)
    {
        if (id != category.CategoryId)
        {
            return BadRequest();
        }

        _context.Entry(category).State =
            EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ============================================================
    // DELETE: api/Categories/{id}
    // ADMIN ONLY
    // ============================================================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category =
            await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}