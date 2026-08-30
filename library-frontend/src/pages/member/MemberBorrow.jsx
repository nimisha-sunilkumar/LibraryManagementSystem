import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

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
      `http://localhost:5000/api/Books/${bookId}`
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
  // DEFAULT DUE DATE
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


    try {

      setBorrowing(true)


      const response = await fetch(
        'http://localhost:5000/api/Borrows',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },

          body: JSON.stringify({

            bookId: Number(bookId),

            dueDate: dueDate

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
              'Failed to borrow book.'

        )

      }


      alert(
        `${book.title} borrowed successfully!`
      )


      // --------------------------------------------------------
      // GO TO MY BORROWED BOOKS
      // --------------------------------------------------------

      navigate('/member/borrowed')


    } catch (error) {

      console.error(
        'Error borrowing book:',
        error
      )

      setError(
        error.message
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
  // ERROR
  // ============================================================

  if (error || !book) {

    return (

      <div className="book-details-page">

        <h1>
          Borrow Book
        </h1>

        <p>
          {error ||
            'Unable to load this book.'}
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
            By {book.authorName ||
              'Unknown Author'}
          </p>

          <p>
            Available Copies:
            {' '}
            {book.availableCopies}
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