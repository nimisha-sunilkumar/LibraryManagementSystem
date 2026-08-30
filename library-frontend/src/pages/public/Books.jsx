import { useEffect, useState } from 'react'

function Books() {
  const [books, setBooks] = useState([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================================
  // GET ALL BOOKS
  // ============================================================
  useEffect(() => {
    fetch('http://localhost:5000/api/Books')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load books.')
        }

        return response.json()
      })
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(error => {
        console.error(error)
        setError('Unable to load books.')
        setLoading(false)
      })
  }, [])


  // ============================================================
  // SEARCH
  // Searches title, author and category
  // ============================================================
  const filteredBooks = books.filter(book => {
    const search = searchText.toLowerCase().trim()

    if (!search) {
      return true
    }

    const title = (book.title || '').toLowerCase()
    const author = (book.authorName || '').toLowerCase()
    const category = (book.categoryName || '').toLowerCase()

    return (
      title.includes(search) ||
      author.includes(search) ||
      category.includes(search)
    )
  })


  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="public-books-page">
        <h1>Books</h1>
        <p>Loading books...</p>
      </div>
    )
  }


  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="public-books-page">
        <h1>Books</h1>
        <p className="public-books-error">
          {error}
        </p>
      </div>
    )
  }


  // ============================================================
  // PAGE
  // ============================================================
  return (
    <div className="public-books-page">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}
      <section className="public-books-header">

        <p className="public-books-label">
          OUR COLLECTION
        </p>

        <h1>Explore Our Books</h1>

        <p>
          Discover books from different authors,
          categories and subjects.
        </p>

      </section>


      {/* ======================================================
          SEARCH
      ======================================================= */}
      <div className="public-books-search">

        <input
          type="text"
          placeholder="Search by title, author or category..."
          value={searchText}
          onChange={event =>
            setSearchText(event.target.value)
          }
        />

      </div>


      {/* ======================================================
          BOOK COUNT
      ======================================================= */}
      <div className="public-books-count">

        {filteredBooks.length} book
        {filteredBooks.length !== 1 ? 's' : ''} found

      </div>


      {/* ======================================================
          BOOK GRID
      ======================================================= */}
      {filteredBooks.length === 0 ? (

        <div className="no-public-books">

          <h2>No books found</h2>

          <p>
            Try searching with another title, author
            or category.
          </p>

        </div>

      ) : (

        <div className="public-books-grid">

          {filteredBooks.map(book => (

            <div
              className="public-book-card"
              key={book.bookId}
            >

              {/* BOOK COVER */}
              <div className="public-book-cover">

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


              {/* BOOK INFORMATION */}
              <div className="public-book-info">

                <h2>{book.title}</h2>

                <p className="public-book-author">
                  {book.authorName || 'Unknown Author'}
                </p>

                <p className="public-book-category">
                  {book.categoryName || 'Unknown Category'}
                </p>

                <p className="public-book-description">
                  {book.description}
                </p>


                {/* AVAILABILITY */}
                <div className="public-book-availability">

                  {book.availableCopies > 0 ? (

                    <span className="available">
                      Available
                    </span>

                  ) : (

                    <span className="unavailable">
                      Currently Unavailable
                    </span>

                  )}

                </div>


                {/* DETAILS BUTTON */}
                <a
                  href={`/books/${book.bookId}`}
                  className="view-book-button"
                >
                  View Details
                </a>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default Books