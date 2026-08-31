import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function MemberBooks() {

  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ============================================================
  // GET BOOKS
  // ============================================================

  const fetchBooks = async () => {

    try {

      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/Books`
      )

      if (!response.ok) {
        throw new Error('Failed to load books.')
      }

      const data = await response.json()

      setBooks(data)

    } catch (error) {

      console.error(error)

      setError('Unable to load books.')

    } finally {

      setLoading(false)

    }

  }


  // ============================================================
  // LOAD BOOKS
  // ============================================================

  useEffect(() => {

    fetchBooks()

  }, [])


  // ============================================================
  // SEARCH
  // ============================================================

  const filteredBooks = books.filter(book => {

    const searchText =
      search.toLowerCase().trim()

    if (!searchText) {
      return true
    }

    const title =
      book.title?.toLowerCase() || ''

    const author =
      book.authorName?.toLowerCase() || ''

    const category =
      (
        book.categoryName ||
        book.category ||
        ''
      ).toLowerCase()

    return (
      title.includes(searchText) ||
      author.includes(searchText) ||
      category.includes(searchText)
    )

  })


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="member-books-page">

        <h1>
          Library Books
        </h1>

        <p>
          Loading books...
        </p>

      </div>

    )

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="member-books-page">

        <h1>
          Library Books
        </h1>

        <p className="auth-error">
          {error}
        </p>

      </div>

    )

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="member-books-page">


      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="page-header">

        <div>

          <p>
            LIBRARY COLLECTION
          </p>

          <h1>
            Explore Books
          </h1>

          <span>
            Find a book and view its details before borrowing.
          </span>

        </div>


        <Link
          to="/member/borrowed"
          className="primary-button"
        >
          My Borrowed Books
        </Link>

      </div>


      {/* ======================================================
          SEARCH
      ======================================================= */}

      <div className="search-section">

        <input
          type="text"
          placeholder="Search by title, author or category..."
          value={search}
          onChange={event =>
            setSearch(event.target.value)
          }
        />

      </div>


      {/* ======================================================
          BOOK GRID
      ======================================================= */}

      {filteredBooks.length === 0 ? (

        <div className="empty-books">

          <h3>
            No books found
          </h3>

          <p>
            Try another title, author or category.
          </p>

        </div>

      ) : (

        <div className="member-books-grid">

          {filteredBooks.map(book => (

            <article
              className="member-book-card"
              key={book.bookId}
            >


              {/* ==================================================
                  COVER
              ================================================== */}

              <div className="member-book-cover">

                {book.coverUrl ? (

                  <img
                    src={book.coverUrl}
                    alt={book.title}
                  />

                ) : (

                  <div className="cover-placeholder">
                    📖
                  </div>

                )}

              </div>


              {/* ==================================================
                  INFORMATION
              ================================================== */}

              <div className="member-book-info">


                {/* CATEGORY */}

                <p className="book-category">

                  {book.categoryName ||
                    book.category ||
                    'Uncategorized'}

                </p>


                {/* TITLE */}

                <h2>
                  {book.title}
                </h2>


                {/* AUTHOR */}

                <p className="book-author">

                  By {book.authorName ||
                    'Unknown Author'}

                </p>


                {/* DESCRIPTION */}

                <p className="book-description">

                  {book.description ||
                    'No description available.'}

                </p>


                {/* =================================================
                    AVAILABILITY
                ================================================== */}

                {book.availableCopies > 0 ? (

                  <p className="available">

                    Available:
                    {' '}
                    {book.availableCopies}

                  </p>

                ) : (

                  <p className="unavailable">

                    Currently unavailable

                  </p>

                )}


                {/* =================================================
                    ACTION
                ================================================== */}

                <div className="member-book-actions">

                  <Link
                    to={`/books/${book.bookId}`}
                    className="secondary-button"
                  >
                    View Details
                  </Link>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>

  )

}

export default MemberBooks