import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function MemberBooks() {

  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedBook, setSelectedBook] = useState(null)
  const [dueDate, setDueDate] = useState('')
  const [borrowing, setBorrowing] = useState(false)

  const [borrowMessage, setBorrowMessage] = useState('')
  const [borrowError, setBorrowError] = useState('')


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


  useEffect(() => {

    fetchBooks()

  }, [])


  // ============================================================
  // SEARCH
  // ============================================================

  const filteredBooks = books.filter(book => {

    const searchText = search
      .toLowerCase()
      .trim()

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
  // OPEN BORROW FORM
  // ============================================================

  const handleBorrowClick = (book) => {

    setSelectedBook(book)

    setDueDate('')

    setBorrowMessage('')
    setBorrowError('')

  }


  // ============================================================
  // CLOSE BORROW FORM
  // ============================================================

  const closeBorrowForm = () => {

    setSelectedBook(null)

    setDueDate('')

    setBorrowMessage('')
    setBorrowError('')

  }


  // ============================================================
  // BORROW BOOK
  // ============================================================

  const handleBorrowBook = async (event) => {

    event.preventDefault()

    setBorrowMessage('')
    setBorrowError('')


    if (!selectedBook) {
      return
    }


    if (!dueDate) {

      setBorrowError(
        'Please select a due date.'
      )

      return

    }


    // ----------------------------------------------------------
    // Borrow date = today
    // ----------------------------------------------------------

    const today =
      new Date().toISOString().split('T')[0]


    // ----------------------------------------------------------
    // Due date cannot be before today
    // ----------------------------------------------------------

    if (dueDate < today) {

      setBorrowError(
        'Due date cannot be before today.'
      )

      return

    }


    const token =
      localStorage.getItem('token')


    if (!token) {

      setBorrowError(
        'Please login before borrowing a book.'
      )

      return

    }


    try {

      setBorrowing(true)


      // ========================================================
      // POST BORROW
      //
      // IMPORTANT:
      // We do NOT send MemberId.
      //
      // The backend gets MemberId from the JWT.
      // ========================================================

      const response = await fetch(
        `${API_URL}/api/Borrows`,
        {
          method: 'POST',

          headers: {

            'Content-Type':
              'application/json',

            'Authorization':
              `Bearer ${token}`

          },

          body: JSON.stringify({

            bookId:
              selectedBook.bookId,

            borrowDate:
              today,

            dueDate:
              dueDate

          })

        }
      )


      const responseText =
        await response.text()


      let data

      try {

        data =
          JSON.parse(responseText)

      } catch {

        data =
          responseText

      }


      if (!response.ok) {

        throw new Error(

          typeof data === 'string'
            ? data
            : data.message ||
              'Unable to borrow the book.'

        )

      }


      // ========================================================
      // SUCCESS
      // ========================================================

      setBorrowMessage(
        `You have successfully borrowed "${selectedBook.title}".`
      )

      setBorrowError('')


      // Update available copies immediately
      setBooks(previousBooks =>
        previousBooks.map(book =>
          book.bookId === selectedBook.bookId
            ? {
                ...book,
                availableCopies:
                  book.availableCopies - 1
              }
            : book
        )
      )


      setSelectedBook(null)
      setDueDate('')


    } catch (error) {

      console.error(
        'Error borrowing book:',
        error
      )

      setBorrowError(
        error.message ||
        'Something went wrong while borrowing the book.'
      )

    } finally {

      setBorrowing(false)

    }

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="member-books-page">

        <h1>Library Books</h1>

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

        <h1>Library Books</h1>

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
            Find a book and borrow it from the library.
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
          SUCCESS MESSAGE
      ======================================================= */}

      {borrowMessage && (

        <div className="borrow-success">

          ✓ {borrowMessage}

        </div>

      )}


      {/* ======================================================
          ERROR MESSAGE
      ======================================================= */}

      {borrowError && !selectedBook && (

        <div className="auth-error">

          {borrowError}

        </div>

      )}


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

              {/* COVER */}

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


              {/* INFORMATION */}

              <div className="member-book-info">

                <p className="book-category">

                  {book.categoryName ||
                    book.category ||
                    'Uncategorized'}

                </p>


                <h2>
                  {book.title}
                </h2>


                <p className="book-author">

                  By {book.authorName ||
                    'Unknown Author'}

                </p>


                <p className="book-description">

                  {book.description ||
                    'No description available.'}

                </p>


                {/* AVAILABILITY */}

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


                {/* ACTIONS */}

                <div className="member-book-actions">

                  <Link
                    to={`/books/${book.bookId}`}
                    className="secondary-button"
                  >
                    View Details
                  </Link>


                  {book.availableCopies > 0 && (

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        handleBorrowClick(book)
                      }
                    >
                      Borrow Book
                    </button>

                  )}

                </div>

              </div>

            </article>

          ))}

        </div>

      )}


      {/* ======================================================
          BORROW MODAL
      ======================================================= */}

      {selectedBook && (

        <div className="borrow-modal-overlay">

          <div className="borrow-modal">

            <h2>
              Borrow Book
            </h2>


            <p>

              You are borrowing:

            </p>


            <h3>
              {selectedBook.title}
            </h3>


            <p>

              Available copies:
              {' '}
              {selectedBook.availableCopies}

            </p>


            <form
              onSubmit={handleBorrowBook}
            >

              <div className="form-group">

                <label>
                  Borrow Date
                </label>

                <input
                  type="date"
                  value={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  readOnly
                />

              </div>


              <div className="form-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={event =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  required
                />

              </div>


              {borrowError && (

                <div className="auth-error">

                  {borrowError}

                </div>

              )}


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeBorrowForm}
                  disabled={borrowing}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={borrowing}
                >

                  {borrowing
                    ? 'Borrowing...'
                    : 'Confirm Borrow'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )
}

export default MemberBooks