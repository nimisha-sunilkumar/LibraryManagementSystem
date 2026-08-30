function PublicHome() {
  return (
    <div className="public-home">

      {/* Public Navigation */}
      <header className="public-navbar">
        <div className="public-logo">
          LIBRARY
        </div>

        <nav>
          <a href="/">Home</a>
          <a href="/books">Books</a>
          <a href="/categories">Categories</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/login" className="login-button">
            Login
          </a>
        </nav>
      </header>


      {/* Hero Section */}
      <section className="hero-section">

        <div className="hero-content">
          <p className="hero-small-title">
            WELCOME TO OUR LIBRARY
          </p>

          <h1>
            Discover. Explore. Borrow. Read.
          </h1>

          <p>
            Explore our collection of books and discover
            something new to read.
          </p>

          <a href="/books" className="explore-button">
            Explore Books
          </a>
        </div>

      </section>


      {/* Featured Books */}
      <section className="featured-section">

        <h2>Featured Books</h2>

        <p className="section-description">
          Discover some of the books available in our library.
        </p>


        <div className="featured-books">

          <div className="book-card">
            <div className="book-cover-placeholder">
              BOOK COVER
            </div>

            <h3>The Alchemist</h3>

            <p>Paulo Coelho</p>

            <span>Available</span>
          </div>


          <div className="book-card">
            <div className="book-cover-placeholder">
              BOOK COVER
            </div>

            <h3>Clean Code</h3>

            <p>Robert C. Martin</p>

            <span>Available</span>
          </div>


          <div className="book-card">
            <div className="book-cover-placeholder">
              BOOK COVER
            </div>

            <h3>Steve Jobs</h3>

            <p>Walter Isaacson</p>

            <span>Available</span>
          </div>

        </div>

      </section>

    </div>
  )
}

export default PublicHome