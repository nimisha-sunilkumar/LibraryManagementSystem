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
public class MembersController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public MembersController(LibraryDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // POST: api/Members
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateMember(CreateMemberDto dto)
    {
        var member = new Member
        {
            FullName = dto.FullName,
            AdmissionNumber = dto.AdmissionNumber,
            Department = dto.Department,
            Year = dto.Year,
            Semester = dto.Semester,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,
            JoinedDate = DateTime.SpecifyKind(
                dto.JoinedDate,
                DateTimeKind.Utc
            ),
            IsActive = dto.IsActive
        };

        _context.Members.Add(member);

        await _context.SaveChangesAsync();

        return Ok(member);
    }

    // =========================================================
    // GET: api/Members
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllMembers()
    {
        var members = await _context.Members.ToListAsync();

        return Ok(members);
    }

    // =========================================================
    // GET: api/Members/search
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpGet("search")]
    public async Task<IActionResult> SearchMembers(
        string? name,
        string? admissionNumber,
        string? department,
        int? year,
        int? semester)
    {
        var query = _context.Members.AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(m =>
                m.FullName.ToLower().Contains(name.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(admissionNumber))
        {
            query = query.Where(m =>
                m.AdmissionNumber.ToLower()
                    .Contains(admissionNumber.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(m =>
                m.Department.ToLower()
                    .Contains(department.ToLower()));
        }

        if (year.HasValue)
        {
            query = query.Where(m =>
                m.Year == year.Value);
        }

        if (semester.HasValue)
        {
            query = query.Where(m =>
                m.Semester == semester.Value);
        }

        var members = await query
            .Select(m => new
            {
                m.MemberId,
                m.FullName,
                m.AdmissionNumber,
                m.Department,
                m.Year,
                m.Semester,
                m.Email,
                m.PhoneNumber,
                m.IsActive
            })
            .ToListAsync();

        if (!members.Any())
        {
            return NotFound("No members found.");
        }

        return Ok(members);
    }

    // =========================================================
    // GET: api/Members/{id}
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMemberById(int id)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
        {
            return NotFound("Member not found.");
        }

        return Ok(member);
    }

    // =========================================================
// GET: api/Members/me
// Logged-in member's own profile
// =========================================================
[Authorize(Roles = "User")]
[HttpGet("me")]
public async Task<IActionResult> GetMyProfile()
{
    var memberIdClaim = User.FindFirst("MemberId")?.Value;

    if (string.IsNullOrEmpty(memberIdClaim))
    {
        return Unauthorized("Member ID not found in token.");
    }

    if (!int.TryParse(memberIdClaim, out int memberId))
    {
        return Unauthorized("Invalid Member ID in token.");
    }

    var member = await _context.Members
        .FirstOrDefaultAsync(m => m.MemberId == memberId);

    if (member == null)
    {
        return NotFound("Member profile not found.");
    }

    return Ok(member);
}

    // =========================================================
    // PUT: api/Members/{id}
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMember(
        int id,
        CreateMemberDto dto)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
        {
            return NotFound("Member not found.");
        }

        member.FullName = dto.FullName;
        member.AdmissionNumber = dto.AdmissionNumber;
        member.Department = dto.Department;
        member.Year = dto.Year;
        member.Semester = dto.Semester;
        member.Email = dto.Email;
        member.PhoneNumber = dto.PhoneNumber;
        member.Address = dto.Address;

        member.JoinedDate = DateTime.SpecifyKind(
            dto.JoinedDate,
            DateTimeKind.Utc
        );

        member.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(member);
    }

    // =========================================================
    // DELETE: api/Members/{id}
    // Admin only
    // =========================================================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(int id)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
        {
            return NotFound("Member not found.");
        }

        _context.Members.Remove(member);

        await _context.SaveChangesAsync();

        return Ok("Member deleted successfully.");
    }
}