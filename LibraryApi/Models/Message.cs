namespace LibraryApi.Models;

public class Message
{
    public int MessageId { get; set; }


    // ============================================================
    // CONVERSATION
    // ============================================================

    public int ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;


    // ============================================================
    // SENDER
    // ============================================================

    // UserAccount of the person who sent the message.
    //
    // For a member message:
    // UserId = that member's UserAccount.
    //
    // For an admin reply:
    // UserId = admin's UserAccount.
    public int UserId { get; set; }

    public UserAccount User { get; set; } = null!;


    // ============================================================
    // MEMBER
    // ============================================================

    // The member who owns this conversation.
    //
    // This remains the same for both:
    // - Member → Admin messages
    // - Admin → Member replies
    public int MemberId { get; set; }

    public Member Member { get; set; } = null!;


    // ============================================================
    // MESSAGE CONTENT
    // ============================================================

    public string Content { get; set; } = string.Empty;


    // ============================================================
    // MESSAGE TYPE
    // ============================================================

    // true  = Admin sent the message
    // false = Member sent the message
    public bool IsFromAdmin { get; set; } = false;


    // ============================================================
    // READ STATUS
    // ============================================================

    public bool IsRead { get; set; } = false;


    // ============================================================
    // CREATED DATE
    // ============================================================

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}