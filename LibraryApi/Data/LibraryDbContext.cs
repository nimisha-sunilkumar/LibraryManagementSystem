using Microsoft.EntityFrameworkCore;
using LibraryApi.Models;

namespace LibraryApi.Data;

public class LibraryDbContext : DbContext
{
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options)
        : base(options)
    {
    }

    public DbSet<Book> Books { get; set; }

    public DbSet<Author> Authors { get; set; }

    public DbSet<BookAuthor> BookAuthors { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<Member> Members { get; set; }

    public DbSet<Borrow> Borrows { get; set; }

    // NEW
    public DbSet<UserAccount> UserAccounts { get; set; }


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
        // USER ACCOUNT
        // ============================================================

        modelBuilder.Entity<UserAccount>()
            .HasKey(u => u.UserId);


        // UserAccount → Member
        //
        // One Member can have one UserAccount.
        // An Admin account can have no Member.
        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Member)
            .WithOne()
            .HasForeignKey<UserAccount>(u => u.MemberId)
            .OnDelete(DeleteBehavior.SetNull);


        base.OnModelCreating(modelBuilder);
    }
}