using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    // POST: api/Members
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
            JoinedDate = DateTime.SpecifyKind(dto.JoinedDate, DateTimeKind.Utc),
            IsActive = dto.IsActive
        };

        _context.Members.Add(member);
        await _context.SaveChangesAsync();

        return Ok(member);
    }

    // GET: api/Members
    [HttpGet]
    public async Task<IActionResult> GetAllMembers()
    {
        return Ok(await _context.Members.ToListAsync());
    }

    // GET: api/Members/search
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
                m.AdmissionNumber.ToLower().Contains(admissionNumber.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(m =>
                m.Department.ToLower().Contains(department.ToLower()));
        }

        if (year.HasValue)
        {
            query = query.Where(m => m.Year == year.Value);
        }

        if (semester.HasValue)
        {
            query = query.Where(m => m.Semester == semester.Value);
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
            return NotFound("No members found.");

        return Ok(members);
    }
    // GET: api/Members/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMemberById(int id)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
            return NotFound("Member not found.");

        return Ok(member);
    }

    // PUT: api/Members/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMember(int id, CreateMemberDto dto)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
            return NotFound("Member not found.");

        member.FullName = dto.FullName;
        member.AdmissionNumber = dto.AdmissionNumber;
        member.Department = dto.Department;
        member.Year = dto.Year;
        member.Semester = dto.Semester;
        member.Email = dto.Email;
        member.PhoneNumber = dto.PhoneNumber;
        member.Address = dto.Address;
        member.JoinedDate = DateTime.SpecifyKind(dto.JoinedDate, DateTimeKind.Utc);
        member.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(member);
    }

    // DELETE: api/Members/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(int id)
    {
        var member = await _context.Members.FindAsync(id);

        if (member == null)
            return NotFound("Member not found.");

        _context.Members.Remove(member);
        await _context.SaveChangesAsync();

        return Ok("Member deleted successfully.");
    }
}