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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite Primary Key for BookAuthor
        modelBuilder.Entity<BookAuthor>()
            .HasKey(ba => new { ba.BookId, ba.AuthorId });

        // Borrow -> Book (Many Borrows belong to One Book)
        modelBuilder.Entity<Borrow>()
            .HasOne(b => b.Book)
            .WithMany(b => b.Borrows)
            .HasForeignKey(b => b.BookId);

        // Borrow -> Member (Many Borrows belong to One Member)
        modelBuilder.Entity<Borrow>()
            .HasOne(b => b.Member)
            .WithMany(m => m.Borrows)
            .HasForeignKey(b => b.MemberId);

        base.OnModelCreating(modelBuilder);
    }
}