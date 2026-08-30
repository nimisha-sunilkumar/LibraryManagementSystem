import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function MyBorrows() {

  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ============================================================
  // GET MY BORROWING HISTORY
  // ============================================================

  const fetchMyBorrows = async () => {

    try {

      const token =
        localStorage.getItem('token')


      if (!token) {

        throw new Error(
          'Please login to view your borrowed books.'
        )

      }


      const response = await fetch(
        `${API_URL}/api/Borrows/my`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
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
              'Unable to load borrowing history.'

        )

      }


      setBorrows(data)

    } catch (error) {

      console.error(error)

      setError(
        error.message ||
        'Unable to load borrowing history.'
      )

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    fetchMyBorrows()

  }, [])


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {

  if (!date) {
    return 'Not returned'
  }

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

}

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="member-borrows-page">

        <h1>
          My Borrowed Books
        </h1>

        <p>
          Loading your borrowing history...
        </p>

      </div>

    )

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="member-borrows-page">

        <h1>
          My Borrowed Books
        </h1>

        <div className="auth-error">
          {error}
        </div>

        <Link
          to="/member/books"
          className="primary-button"
        >
          Browse Books
        </Link>

      </div>

    )

  }


  return (

    <div className="member-borrows-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <p>
            MY LIBRARY ACCOUNT
          </p>

          <h1>
            My Borrowed Books
          </h1>

          <span>
            View the books you have borrowed from the library.
          </span>

        </div>


        <Link
          to="/member/books"
          className="primary-button"
        >
          Browse Books
        </Link>

      </div>


      {/* ======================================================
          BORROW RECORDS
      ======================================================= */}

      {borrows.length === 0 ? (

        <div className="empty-books">

          <h2>
            No borrowed books
          </h2>

          <p>
            You haven't borrowed any books yet.
          </p>

          <Link
            to="/member/books"
            className="primary-button"
          >
            Explore Books
          </Link>

        </div>

      ) : (

        <div className="member-borrow-list">

          {borrows.map(borrow => (

            <article
              className="member-borrow-card"
              key={borrow.borrowId}
            >

              <div>

                <h2>
                  {borrow.bookTitle}
                </h2>

                <p>
                  Borrowed on:{' '}
                  {formatDate(
                    borrow.borrowDate
                  )}
                </p>

                <p>
                  Due date:{' '}
                  {formatDate(
                    borrow.dueDate
                  )}
                </p>

                {borrow.returnDate && (

                  <p>
                    Returned on:{' '}
                    {formatDate(
                      borrow.returnDate
                    )}
                  </p>

                )}

              </div>


              <div className="borrow-status">

                <span
                  className={
                    borrow.status === 'Returned'
                      ? 'returned'
                      : 'borrowed'
                  }
                >

                  {borrow.status}

                </span>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>

  )
}

export default MyBorrows