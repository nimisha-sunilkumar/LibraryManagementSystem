namespace LibraryApi.Models;

public class Conversation
{
    public int ConversationId { get; set; }

    // The member who started the conversation
    public int MemberId { get; set; }

    public Member Member { get; set; } = null!;

    // Subject of the conversation
    public string Subject { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Whether the conversation is closed by admin
    public bool IsClosed { get; set; } = false;

    // All messages in this conversation
    public ICollection<Message> Messages { get; set; }
        = new List<Message>();
}