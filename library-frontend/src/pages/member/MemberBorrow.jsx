import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function MemberBorrow() {

  const { bookId } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [dueDate, setDueDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)

  const [error, setError] = useState('')


  // ============================================================
  // LOGIN INFORMATION
  // ============================================================

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const memberId = localStorage.getItem('memberId')


  // ============================================================
  // CHECK MEMBER LOGIN
  // ============================================================

  useEffect(() => {

    if (!token || role !== 'User' || !memberId) {

      alert(
        'Please login with a member account to borrow books.'
      )

      navigate('/login')

    }

  }, [token, role, memberId, navigate])


  // ============================================================
  // GET BOOK
  // ============================================================

  useEffect(() => {

    if (!token || role !== 'User' || !memberId) {
      return
    }

    fetch(
      `${API_URL}/api/Books/${bookId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

      .then(response => {

        if (!response.ok) {
          throw new Error('Book not found.')
        }

        return response.json()

      })

      .then(data => {

        setBook(data)
        setLoading(false)

      })

      .catch(error => {

        console.error(error)

        setError(
          'Unable to load book information.'
        )

        setLoading(false)

      })

  }, [bookId, token, role, memberId])


  // ============================================================
  // DEFAULT DUE DATE = 7 DAYS FROM TODAY
  // ============================================================

  useEffect(() => {

    const date = new Date()

    date.setDate(
      date.getDate() + 7
    )

    const formattedDate =
      date.toISOString().split('T')[0]

    setDueDate(formattedDate)

  }, [])


  // ============================================================
  // CONFIRM BORROW
  // ============================================================

  const handleBorrow = async (event) => {

    event.preventDefault()

    setError('')


    if (!dueDate) {

      setError(
        'Please select a due date.'
      )

      return

    }


    // ----------------------------------------------------------
    // TODAY'S DATE
    // ----------------------------------------------------------

    const today =
      new Date().toISOString().split('T')[0]


    // ----------------------------------------------------------
    // CHECK DUE DATE
    // ----------------------------------------------------------

    if (dueDate < today) {

      setError(
        'Due date cannot be before today.'
      )

      return

    }


    try {

      setBorrowing(true)


      // ========================================================
      // SEND BORROW REQUEST
      // ========================================================

      const response = await fetch(
        `${API_URL}/api/Borrows`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            'Authorization': `Bearer ${token}`
          },

          body: JSON.stringify({

            bookId: Number(bookId),

            // IMPORTANT:
            // Backend CreateBorrowDto expects BorrowDate
            borrowDate: today,

            dueDate: dueDate

          })
        }
      )


      // ========================================================
      // READ RESPONSE
      // ========================================================

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


      // ========================================================
      // HANDLE ERROR
      // ========================================================

      if (!response.ok) {

        throw new Error(

          typeof data === 'string'
            ? data
            : data.message ||
              'Failed to borrow book.'

        )

      }


      // ========================================================
      // SUCCESS
      // ========================================================

      alert(
        `${book.title} borrowed successfully!`
      )


      // ========================================================
      // GO TO MY BORROWED BOOKS
      // ========================================================

      navigate('/member/borrowed')


    } catch (error) {

      console.error(
        'Error borrowing book:',
        error
      )

      setError(
        error.message ||
        'Failed to borrow book.'
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

      <div className="book-details-page">

        <p>
          Loading book information...
        </p>

      </div>

    )

  }


  // ============================================================
  // ERROR / BOOK NOT FOUND
  // ============================================================

  if (error && !book) {

    return (

      <div className="book-details-page">

        <h1>
          Borrow Book
        </h1>

        <p>
          {error}
        </p>

        <Link
          to="/member/books"
          className="back-to-books"
        >
          ← Back to Books
        </Link>

      </div>

    )

  }


  if (!book) {

    return (

      <div className="book-details-page">

        <h1>
          Borrow Book
        </h1>

        <p>
          Unable to load this book.
        </p>

      </div>

    )

  }


  // ============================================================
  // BOOK NOT AVAILABLE
  // ============================================================

  if (book.availableCopies <= 0) {

    return (

      <div className="book-details-page">

        <h1>
          Book Unavailable
        </h1>

        <p>
          Sorry, this book is currently unavailable.
        </p>

        <Link
          to={`/books/${bookId}`}
          className="back-to-books"
        >
          ← Back to Book
        </Link>

      </div>

    )

  }


  // ============================================================
  // BORROW FORM
  // ============================================================

  return (

    <div className="book-details-page">

      <Link
        to={`/books/${bookId}`}
        className="back-to-books"
      >
        ← Back to Book
      </Link>


      <div className="borrow-form-container">

        <h1>
          Borrow This Book
        </h1>


        <div className="borrow-book-summary">

          <h2>
            {book.title}
          </h2>

          <p>
            By {book.authorName || 'Unknown Author'}
          </p>

          <p>
            Available Copies: {book.availableCopies}
          </p>

        </div>


        <form
          className="borrow-form"
          onSubmit={handleBorrow}
        >

          <div className="form-group">

            <label htmlFor="dueDate">
              Choose Due Date
            </label>

            <input
              id="dueDate"
              type="date"
              value={dueDate}
              min={
                new Date()
                  .toISOString()
                  .split('T')[0]
              }
              onChange={(event) =>
                setDueDate(
                  event.target.value
                )
              }
              required
            />

          </div>


          {error && (

            <div className="auth-error">
              {error}
            </div>

          )}


          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={borrowing}
            >

              {borrowing
                ? 'Borrowing...'
                : 'Confirm Borrow'}

            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(`/books/${bookId}`)
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  )

}

export default MemberBorrow