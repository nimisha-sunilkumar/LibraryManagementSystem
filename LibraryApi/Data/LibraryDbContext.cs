using Microsoft.EntityFrameworkCore;
using LibraryApi.Models;

namespace LibraryApi.Data;

public class LibraryDbContext : DbContext
{
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options)
        : base(options)
    {
    }


    // ============================================================
    // DATABASE TABLES
    // ============================================================

    public DbSet<Book> Books { get; set; }

    public DbSet<Author> Authors { get; set; }

    public DbSet<BookAuthor> BookAuthors { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<Member> Members { get; set; }

    public DbSet<Borrow> Borrows { get; set; }

    public DbSet<UserAccount> UserAccounts { get; set; }

    public DbSet<Message> Messages { get; set; }

    public DbSet<Conversation> Conversations { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ============================================================
        // BOOK AUTHOR
        // ============================================================

        modelBuilder.Entity<BookAuthor>()
            .HasKey(ba => new { ba.BookId, ba.AuthorId });


        // ============================================================
        // BORROW → BOOK
        // ============================================================

        modelBuilder.Entity<Borrow>()
            .HasOne(b => b.Book)
            .WithMany(b => b.Borrows)
            .HasForeignKey(b => b.BookId);


        // ============================================================
        // BORROW → MEMBER
        // ============================================================

        modelBuilder.Entity<Borrow>()
            .HasOne(b => b.Member)
            .WithMany(m => m.Borrows)
            .HasForeignKey(b => b.MemberId);


        // ============================================================
        // BOOK → CATEGORY
        // ============================================================

        modelBuilder.Entity<Book>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Books)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // ============================================================
        // USER ACCOUNT → MEMBER
        // ============================================================

        modelBuilder.Entity<UserAccount>()
            .HasKey(u => u.UserId);

        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Member)
            .WithOne()
            .HasForeignKey<UserAccount>(u => u.MemberId)
            .OnDelete(DeleteBehavior.SetNull);


        // ============================================================
        // CONVERSATION → MEMBER
        // ============================================================

        modelBuilder.Entity<Conversation>()
            .HasKey(c => c.ConversationId);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.Member)
            .WithMany()
            .HasForeignKey(c => c.MemberId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // CONVERSATION → MESSAGES
        // ============================================================

        modelBuilder.Entity<Message>()
            .HasKey(m => m.MessageId);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // MESSAGE → USER ACCOUNT
        // ============================================================

        modelBuilder.Entity<Message>()
            .HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // MESSAGE → MEMBER
        // ============================================================

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Member)
            .WithMany()
            .HasForeignKey(m => m.MemberId)
            .OnDelete(DeleteBehavior.Cascade);


        base.OnModelCreating(modelBuilder);
    }
}