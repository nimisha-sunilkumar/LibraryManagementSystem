using LibraryApi.Data;
using LibraryApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public DashboardController(LibraryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard = new DashboardDto
        {
            // Number of different book titles/records
            TotalBooks = await _context.Books.CountAsync(),

            // Total number of physical copies
            TotalCopies = await _context.Books
                .SumAsync(b => b.TotalCopies),

            TotalAuthors = await _context.Authors.CountAsync(),

            TotalCategories = await _context.Categories.CountAsync(),

            TotalMembers = await _context.Members.CountAsync(),

            // Currently borrowed copies
            BooksBorrowed = await _context.Borrows
                .CountAsync(b => b.ReturnDate == null),

            // Currently available copies
            BooksAvailable = await _context.Books
                .SumAsync(b => b.AvailableCopies)
        };

        return Ok(dashboard);
    }
}