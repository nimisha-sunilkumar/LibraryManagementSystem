import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="public-home">

      {/* =========================
          PUBLIC NAVBAR
      ========================== */}
      <nav className="public-navbar">

        <div className="public-logo">
          LIBRARY
        </div>

        <div className="public-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/books">
            Books
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/contact">
            Contact
          </Link>

          <Link
            to="/login"
            className="login-button"
          >
            Login
          </Link>

        </div>

      </nav>


      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-small-title">
            WELCOME TO OUR LIBRARY
          </p>

          <h1>
            Discover Your Next
            <br />
            Great Read
          </h1>

          <p className="hero-description">
            Explore our collection of books, discover new
            stories, and find something you'll love to read.
          </p>

          <Link
            to="/books"
            className="explore-button"
          >
            Explore Books
          </Link>

        </div>

      </section>


      {/* =========================
          FEATURE SECTION
      ========================== */}
      <section className="featured-section">

        <div className="section-heading">

          <p>EXPLORE OUR COLLECTION</p>

          <h2>
            Featured Books
          </h2>

          <span>
            Discover some of the books available in our library.
          </span>

        </div>


        <div className="featured-placeholder">

          <div className="book-placeholder">
            <div className="placeholder-cover">
              📖
            </div>

            <h3>
              The Alchemist
            </h3>

            <p>
              Discover more books from our collection.
            </p>
          </div>

          <div className="book-placeholder">
            <div className="placeholder-cover">
              📚
            </div>

            <h3>
              Clean Code
            </h3>

            <p>
              Discover more books from our collection.
            </p>
          </div>

          <div className="book-placeholder">
            <div className="placeholder-cover">
              📕
            </div>

            <h3>
              Wings of Fire
            </h3>

            <p>
              Discover more books from our collection.
            </p>
          </div>

        </div>

      </section>


      {/* =========================
          ABOUT SECTION
      ========================== */}
      <section className="home-about">

        <div>

          <p className="section-label">
            OUR LIBRARY
          </p>

          <h2>
            A place for readers,
            <br />
            learners and explorers.
          </h2>

          <p>
            Our library provides access to a growing collection
            of books across different subjects and categories.
            Browse our catalogue and discover your next book.
          </p>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================== */}
      <footer className="public-footer">

        <div>
          <strong>
            LIBRARY
          </strong>

          <p>
            Discover • Explore • Read
          </p>
        </div>

        <p>
          © 2026 Library Management System
        </p>

      </footer>

    </div>
  )
}

export default Home