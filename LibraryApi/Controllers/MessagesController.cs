using LibraryApi.DTOs;
using LibraryApi.Data;
using LibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public MessagesController(LibraryDbContext context)
    {
        _context = context;
    }


    // ============================================================
    // POST: api/Messages
    // MEMBER STARTS A NEW CONVERSATION
    // ============================================================

    [Authorize(Roles = "User")]
    [HttpPost]
    public async Task<IActionResult> CreateConversation(
        CreateMessageDto dto)
    {
        // --------------------------------------------------------
        // Validate subject
        // --------------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.Subject))
        {
            return BadRequest("Subject is required.");
        }


        // --------------------------------------------------------
        // Validate message
        // --------------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.Content))
        {
            return BadRequest("Message is required.");
        }


        // --------------------------------------------------------
        // Get UserId from JWT
        // --------------------------------------------------------

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized("Invalid user authentication.");
        }


        // --------------------------------------------------------
        // Find UserAccount and linked Member
        // --------------------------------------------------------

        var user = await _context.UserAccounts
            .Include(u => u.Member)
            .FirstOrDefaultAsync(u => u.UserId == userId);


        if (user == null)
        {
            return Unauthorized("User account not found.");
        }


        // --------------------------------------------------------
        // Make sure the account belongs to a Member
        // --------------------------------------------------------

        if (!user.MemberId.HasValue || user.Member == null)
        {
            return BadRequest(
                "Your account is not linked to a library member."
            );
        }


        // ========================================================
        // CREATE CONVERSATION
        // ========================================================

        var conversation = new Conversation
        {
            MemberId = user.Member.MemberId,

            Subject = dto.Subject.Trim(),

            CreatedAt = DateTime.UtcNow,

            IsClosed = false
        };


        _context.Conversations.Add(conversation);

        await _context.SaveChangesAsync();


        // ========================================================
        // CREATE FIRST MESSAGE
        // ========================================================

        var message = new Message
        {
            ConversationId = conversation.ConversationId,

            UserId = user.UserId,

            MemberId = user.Member.MemberId,

            Content = dto.Content.Trim(),

            IsFromAdmin = false,

            IsRead = false,

            CreatedAt = DateTime.UtcNow
        };


        _context.Messages.Add(message);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Your message has been sent successfully.",

            conversationId =
                conversation.ConversationId
        });
    }

// ============================================================
// GET: api/Messages/my
// MEMBER VIEW THEIR OWN CONVERSATIONS
// ============================================================

[Authorize(Roles = "User")]
[HttpGet("my")]
public async Task<IActionResult> GetMyConversations()
{
    // --------------------------------------------------------
    // Get logged-in UserId from JWT
    // --------------------------------------------------------

    var userIdValue =
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (!int.TryParse(userIdValue, out int userId))
    {
        return Unauthorized(
            "Invalid user authentication."
        );
    }


    // --------------------------------------------------------
    // Find UserAccount and linked Member
    // --------------------------------------------------------

    var user = await _context.UserAccounts
        .Include(u => u.Member)
        .FirstOrDefaultAsync(
            u => u.UserId == userId
        );


    if (user == null)
    {
        return Unauthorized(
            "User account not found."
        );
    }


    // --------------------------------------------------------
    // Make sure account belongs to a Member
    // --------------------------------------------------------

    if (!user.MemberId.HasValue || user.Member == null)
    {
        return BadRequest(
            "Your account is not linked to a library member."
        );
    }


    var memberId = user.Member.MemberId;


    // ========================================================
    // GET MEMBER'S CONVERSATIONS
    // ========================================================

    var conversations = await _context.Conversations

        .Where(c =>
            c.MemberId == memberId
        )

        .Include(c => c.Messages)

        .OrderByDescending(
            c => c.CreatedAt
        )

        .Select(c => new
        {
            c.ConversationId,

            c.Subject,

            c.CreatedAt,

            c.IsClosed,

            MemberId = c.MemberId,

            MessageCount = c.Messages.Count,

            // ------------------------------------------------
            // Count unread ADMIN messages
            // ------------------------------------------------

            UnreadCount = c.Messages.Count(
                m =>
                    !m.IsRead &&
                    m.IsFromAdmin
            ),

            // ------------------------------------------------
            // Last message
            // ------------------------------------------------

            LastMessage = c.Messages

                .OrderByDescending(
                    m => m.CreatedAt
                )

                .Select(m => new
                {
                    m.MessageId,

                    m.Content,

                    m.IsFromAdmin,

                    m.IsRead,

                    m.CreatedAt
                })

                .FirstOrDefault()
        })

        .ToListAsync();


    return Ok(conversations);
}
    // ============================================================
    // GET: api/Messages
    // ADMIN VIEW ALL CONVERSATIONS
    // ============================================================

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var conversations = await _context.Conversations
            .Include(c => c.Member)
            .Include(c => c.Messages)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.ConversationId,

                c.Subject,

                c.CreatedAt,

                c.IsClosed,

                MemberId = c.MemberId,

                MemberName = c.Member.FullName,

                MemberEmail = c.Member.Email,

                MessageCount = c.Messages.Count,

                UnreadCount = c.Messages
                    .Count(m =>
                        !m.IsRead &&
                        !m.IsFromAdmin),

                LastMessage = c.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.MessageId,

                        m.Content,

                        m.IsFromAdmin,

                        m.IsRead,

                        m.CreatedAt
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();


        return Ok(conversations);
    }


    // ============================================================
    // GET: api/Messages/{conversationId}
    // VIEW ONE CONVERSATION
    // ============================================================

    [Authorize]
    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetConversation(
        int conversationId)
    {
        // --------------------------------------------------------
        // Get logged-in UserId
        // --------------------------------------------------------

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized("Invalid user authentication.");
        }


        // --------------------------------------------------------
        // Find conversation
        // --------------------------------------------------------

        var conversation = await _context.Conversations
            .Include(c => c.Member)
            .Include(c => c.Messages)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(
                c => c.ConversationId == conversationId
            );


        if (conversation == null)
        {
            return NotFound("Conversation not found.");
        }


        // ========================================================
        // ADMIN CAN VIEW ANY CONVERSATION
        // ========================================================

        var isAdmin =
            User.IsInRole("Admin");


        // ========================================================
        // MEMBER CAN ONLY VIEW THEIR OWN CONVERSATION
        // ========================================================

        if (!isAdmin)
        {
            var memberIdValue =
                User.FindFirstValue("MemberId");

            if (!int.TryParse(
                memberIdValue,
                out int memberId))
            {
                return Unauthorized(
                    "Member information not found."
                );
            }


            if (conversation.MemberId != memberId)
            {
                return Forbid();
            }
        }


        // --------------------------------------------------------
        // Return conversation
        // --------------------------------------------------------

        return Ok(new
        {
            conversation.ConversationId,

            conversation.Subject,

            conversation.CreatedAt,

            conversation.IsClosed,

            MemberId = conversation.MemberId,

            MemberName = conversation.Member.FullName,

            MemberEmail = conversation.Member.Email,

            Messages = conversation.Messages
                .OrderBy(m => m.CreatedAt)
                .Select(m => new
                {
                    m.MessageId,

                    m.Content,

                    m.IsFromAdmin,

                    m.IsRead,

                    m.CreatedAt,

                    SenderEmail = m.User.Email
                })
        });
    }


    // ============================================================
    // POST: api/Messages/{conversationId}/reply
    // MEMBER OR ADMIN REPLIES
    // ============================================================

    [Authorize]
    [HttpPost("{conversationId}/reply")]
    public async Task<IActionResult> Reply(
        int conversationId,
        ReplyMessageDto dto)
    {
        // --------------------------------------------------------
        // Validate message
        // --------------------------------------------------------

        if (string.IsNullOrWhiteSpace(dto.Content))
        {
            return BadRequest("Message is required.");
        }


        // --------------------------------------------------------
        // Get logged-in UserId
        // --------------------------------------------------------

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized("Invalid user authentication.");
        }


        // --------------------------------------------------------
        // Find user
        // --------------------------------------------------------

        var user = await _context.UserAccounts
            .Include(u => u.Member)
            .FirstOrDefaultAsync(u => u.UserId == userId);


        if (user == null)
        {
            return Unauthorized("User account not found.");
        }


        // --------------------------------------------------------
        // Find conversation
        // --------------------------------------------------------

        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(
                c => c.ConversationId == conversationId
            );


        if (conversation == null)
        {
            return NotFound("Conversation not found.");
        }


        // --------------------------------------------------------
        // Do not allow replies to closed conversations
        // --------------------------------------------------------

        if (conversation.IsClosed)
        {
            return BadRequest(
                "This conversation has been closed."
            );
        }


        // ========================================================
        // CHECK MEMBER ACCESS
        // ========================================================

        if (!User.IsInRole("Admin"))
        {
            if (!user.MemberId.HasValue)
            {
                return Forbid();
            }


            if (conversation.MemberId != user.MemberId.Value)
            {
                return Forbid();
            }
        }


        // ========================================================
        // CREATE REPLY
        // ========================================================

        var reply = new Message
        {
            ConversationId =
                conversation.ConversationId,

            UserId =
                user.UserId,

            MemberId =
                conversation.MemberId,

            Content =
                dto.Content.Trim(),

            IsFromAdmin =
                User.IsInRole("Admin"),

            IsRead = false,

            CreatedAt = DateTime.UtcNow
        };


        _context.Messages.Add(reply);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Reply sent successfully.",

            messageId = reply.MessageId
        });
    }


    // ============================================================
    // PUT: api/Messages/{conversationId}/read
    // MARK CONVERSATION MESSAGES AS READ
    // ============================================================

    [Authorize]
    [HttpPut("{conversationId}/read")]
    public async Task<IActionResult> MarkAsRead(
        int conversationId)
    {
        // --------------------------------------------------------
        // Get UserId
        // --------------------------------------------------------

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized("Invalid authentication.");
        }


        // --------------------------------------------------------
        // Find conversation
        // --------------------------------------------------------

        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(
                c => c.ConversationId == conversationId
            );


        if (conversation == null)
        {
            return NotFound("Conversation not found.");
        }


        // --------------------------------------------------------
        // Check access
        // --------------------------------------------------------

        if (!User.IsInRole("Admin"))
        {
            var memberIdValue =
                User.FindFirstValue("MemberId");

            if (!int.TryParse(
                memberIdValue,
                out int memberId))
            {
                return Unauthorized();
            }


            if (conversation.MemberId != memberId)
            {
                return Forbid();
            }
        }


        // --------------------------------------------------------
        // Determine whose messages should become read
        // --------------------------------------------------------

        bool isAdmin = User.IsInRole("Admin");


        var unreadMessages = await _context.Messages
            .Where(m =>
                m.ConversationId == conversationId &&
                !m.IsRead &&
                m.IsFromAdmin != isAdmin)
            .ToListAsync();


        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
        }


        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Messages marked as read."
        });
    }


    // ============================================================
    // PUT: api/Messages/{conversationId}/close
    // ADMIN CLOSES CONVERSATION
    // ============================================================

    [Authorize(Roles = "Admin")]
    [HttpPut("{conversationId}/close")]
    public async Task<IActionResult> CloseConversation(
        int conversationId)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(
                c => c.ConversationId == conversationId
            );


        if (conversation == null)
        {
            return NotFound("Conversation not found.");
        }


        conversation.IsClosed = true;

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Conversation closed successfully."
        });
    }
}