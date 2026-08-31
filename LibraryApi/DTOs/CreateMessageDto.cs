namespace LibraryApi.DTOs;

public class CreateMessageDto
{
    public string Subject { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
}