import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function BookDetails() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ============================================================
  // LOGIN INFORMATION
  // ============================================================

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const memberId = localStorage.getItem('memberId')

  const isLoggedIn = !!token

  // IMPORTANT:
  // Your backend returns role = "User" for members.
  const isMember = role === 'User' && !!memberId


  // ============================================================
  // GET BOOK BY ID
  // ============================================================

  useEffect(() => {

    fetch(`http://localhost:5000/api/Books/${id}`)

      .then(response => {

        if (!response.ok) {
          throw new Error('Book not found')
        }

        return response.json()
      })

      .then(data => {

        setBook(data)
        setLoading(false)

      })

      .catch(error => {

        console.error(error)

        setError('Unable to load book details.')
        setLoading(false)

      })

  }, [id])


  // ============================================================
  // HANDLE BORROW BUTTON
  // ============================================================

  const handleBorrowClick = () => {

    // ----------------------------------------------------------
    // NOT LOGGED IN
    // ----------------------------------------------------------

    if (!isLoggedIn) {

      navigate('/login', {
        state: {
          from: `/books/${id}`
        }
      })

      return
    }


    // ----------------------------------------------------------
    // ADMIN OR INVALID USER
    // ----------------------------------------------------------

    if (!isMember) {

      alert(
        'Borrowing is available only for library members.'
      )

      return
    }


    // ----------------------------------------------------------
    // MEMBER
    // ----------------------------------------------------------

    navigate(`/member/borrow/${id}`)
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="book-details-page">

        <p>
          Loading book details...
        </p>

      </div>

    )
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error || !book) {

    return (

      <div className="book-details-page">

        <h1>
          Book Not Found
        </h1>

        <p>
          {error ||
            'The requested book could not be found.'}
        </p>

        <Link
          to="/books"
          className="back-to-books"
        >
          ← Back to Books
        </Link>

      </div>

    )
  }


  // ============================================================
  // BOOK DETAILS
  // ============================================================

  return (

    <div className="book-details-page">

      <Link
        to="/books"
        className="back-to-books"
      >
        ← Back to Books
      </Link>


      <div className="book-details-container">


        {/* ======================================================
            BOOK COVER
        ======================================================= */}

        <div className="book-details-cover">

          {book.coverUrl ? (

            <img
              src={book.coverUrl}
              alt={book.title}
            />

          ) : (

            <div className="details-cover-placeholder">
              📖
            </div>

          )}

        </div>


        {/* ======================================================
            BOOK INFORMATION
        ======================================================= */}

        <div className="book-details-info">


          <p className="details-category">

            {book.categoryName ||
              'Uncategorized'}

          </p>


          <h1>
            {book.title}
          </h1>


          <h3>
            By {book.authorName ||
              'Unknown Author'}
          </h3>


          {/* ====================================================
              DESCRIPTION
          ===================================================== */}

          <div className="details-section">

            <h2>
              Description
            </h2>

            <p>

              {book.description ||
                'No description available.'}

            </p>

          </div>


          {/* ====================================================
              BOOK INFORMATION
          ===================================================== */}

          <div className="details-section">

            <h2>
              Book Information
            </h2>


            <div className="book-information">

              <div>

                <span>
                  ISBN
                </span>

                <strong>
                  {book.isbn ||
                    'Not available'}
                </strong>

              </div>


              <div>

                <span>
                  Published Date
                </span>

                <strong>
                  {book.publishedDate
                    ? book.publishedDate.substring(0, 10)
                    : 'Not available'}
                </strong>

              </div>

            </div>

          </div>


          {/* ====================================================
              AVAILABILITY
          ===================================================== */}

          <div className="details-section">

            <h2>
              Availability
            </h2>


            <div className="availability-box">

              <div>

                <span>
                  Available Copies
                </span>

                <strong>
                  {book.availableCopies}
                </strong>

              </div>


              <div>

                <span>
                  Total Copies
                </span>

                <strong>
                  {book.totalCopies}
                </strong>

              </div>

            </div>


            {book.availableCopies > 0 ? (

              <p className="details-available">

                ✓ This book is currently available.

              </p>

            ) : (

              <p className="details-unavailable">

                This book is currently unavailable.

              </p>

            )}

          </div>


          {/* ====================================================
              BORROW BUTTON
          ===================================================== */}

          {book.availableCopies > 0 && (

            <div className="borrow-section">

              <button
                type="button"
                className="login-borrow-button"
                onClick={handleBorrowClick}
              >

                {!isLoggedIn
                  ? 'Login to Borrow'
                  : isMember
                  ? 'Borrow This Book'
                  : 'Member Login Required'}

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  )
}

export default BookDetails