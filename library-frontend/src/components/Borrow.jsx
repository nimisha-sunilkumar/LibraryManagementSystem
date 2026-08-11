import { useEffect, useState } from 'react'

function Borrow() {
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [borrows, setBorrows] = useState([])
  const [overdueBooks, setOverdueBooks] = useState([])

  const [borrowData, setBorrowData] = useState({
    bookId: '',
    memberId: '',
    borrowDate: '',
    dueDate: ''
  })

  // =========================
  // GET BOOKS
  // =========================
  const fetchBooks = async () => {
    try {
      const response = await fetch(
        'http://localhost:5213/api/Books'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }

      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  // =========================
  // GET MEMBERS
  // =========================
  const fetchMembers = async () => {
    try {
      const response = await fetch(
        'http://localhost:5213/api/Members'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  // =========================
  // GET BORROW RECORDS
  // =========================
  const fetchBorrows = async () => {
    try {
      const response = await fetch(
        'http://localhost:5213/api/Borrows'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch borrowing records')
      }

      const data = await response.json()
      setBorrows(data)
    } catch (error) {
      console.error('Error fetching borrows:', error)
    }
  }

  // =========================
  // GET OVERDUE BOOKS
  // =========================
  const fetchOverdueBooks = async () => {
    try {
      const response = await fetch(
        'http://localhost:5213/api/Borrows/overdue'
      )

      // Backend returns 404 when there are no overdue books
      if (response.status === 404) {
        setOverdueBooks([])
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch overdue books')
      }

      const data = await response.json()
      setOverdueBooks(data)
    } catch (error) {
      console.error('Error fetching overdue books:', error)
      setOverdueBooks([])
    }
  }

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchBooks()
    fetchMembers()
    fetchBorrows()
    fetchOverdueBooks()
  }, [])

  // =========================
  // BORROW BOOK
  // =========================
  const handleBorrowBook = async (event) => {
    event.preventDefault()

    if (
      !borrowData.bookId ||
      !borrowData.memberId ||
      !borrowData.borrowDate ||
      !borrowData.dueDate
    ) {
      alert('Please fill in all fields.')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5213/api/Borrows',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookId: Number(borrowData.bookId),
            memberId: Number(borrowData.memberId),
            borrowDate: borrowData.borrowDate,
            dueDate: borrowData.dueDate
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data)
        return
      }

      alert('Book borrowed successfully!')

      setBorrowData({
        bookId: '',
        memberId: '',
        borrowDate: '',
        dueDate: ''
      })

      await fetchBooks()
      await fetchBorrows()
      await fetchOverdueBooks()

    } catch (error) {
      console.error('Error borrowing book:', error)
      alert('Something went wrong while borrowing the book.')
    }
  }

  // =========================
  // RETURN BOOK
  // =========================
  const handleReturnBook = async (borrowId) => {
    const confirmed = window.confirm(
      'Are you sure you want to return this book?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5213/api/Borrows/return',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            borrowId: borrowId,
            returnDate: new Date().toISOString()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data)
        return
      }

      alert('Book returned successfully!')

      await fetchBooks()
      await fetchBorrows()
      await fetchOverdueBooks()

    } catch (error) {
      console.error('Error returning book:', error)
      alert('Something went wrong while returning the book.')
    }
  }

  return (
    <div>

      <h1>Borrow & Return</h1>

      {/* ========================= */}
      {/* BORROW BOOK */}
      {/* ========================= */}

      <div className="borrow-form">

        <h2>Borrow a Book</h2>

        <form onSubmit={handleBorrowBook}>

          <label>Book</label>

          <select
            value={borrowData.bookId}
            onChange={(event) =>
              setBorrowData({
                ...borrowData,
                bookId: event.target.value
              })
            }
          >
            <option value="">
              Select a book
            </option>

            {books
              .filter(book => book.availableCopies > 0)
              .map(book => (
                <option
                  key={book.bookId}
                  value={book.bookId}
                >
                  {book.title} — Available: {book.availableCopies}
                </option>
              ))}
          </select>

          <br />

          <label>Member</label>

          <select
            value={borrowData.memberId}
            onChange={(event) =>
              setBorrowData({
                ...borrowData,
                memberId: event.target.value
              })
            }
          >
            <option value="">
              Select a member
            </option>

            {members
              .filter(member => member.isActive)
              .map(member => (
                <option
                  key={member.memberId}
                  value={member.memberId}
                >
                  {member.fullName} — {member.admissionNumber}
                </option>
              ))}
          </select>

          <br />

          <label>Borrow Date</label>

          <input
            type="date"
            value={borrowData.borrowDate}
            onChange={(event) =>
              setBorrowData({
                ...borrowData,
                borrowDate: event.target.value
              })
            }
          />

          <br />

          <label>Due Date</label>

          <input
            type="date"
            value={borrowData.dueDate}
            onChange={(event) =>
              setBorrowData({
                ...borrowData,
                dueDate: event.target.value
              })
            }
          />

          <br />

          <button type="submit">
            Borrow Book
          </button>

        </form>

      </div>

      {/* ========================= */}
      {/* BORROWING RECORDS */}
      {/* ========================= */}

      <div className="borrow-list">

        <h2>Borrowing Records</h2>

        {borrows.map(borrow => (

          <div
            className="borrow-card"
            key={borrow.borrowId}
          >

            <h3>{borrow.bookTitle}</h3>

            <p>
              Member: {borrow.memberName}
            </p>

            <p>
              Borrow Date: {borrow.borrowDate}
            </p>

            <p>
              Due Date: {borrow.dueDate}
            </p>

            <p>
              Return Date:{' '}
              {borrow.returnDate || 'Not returned'}
            </p>

            <p>
              Status: {borrow.status}
            </p>

            {borrow.status !== 'Returned' && (

              <button
                onClick={() =>
                  handleReturnBook(borrow.borrowId)
                }
              >
                Return Book
              </button>

            )}

          </div>

        ))}

        {borrows.length === 0 && (
          <p>No borrowing records found.</p>
        )}

      </div>

      {/* ========================= */}
      {/* OVERDUE BOOKS */}
      {/* ========================= */}

      <div className="overdue-list">

        <h2>Overdue Books</h2>

        {overdueBooks.map(book => (

          <div
            className="overdue-card"
            key={book.borrowId}
          >

            <h3>{book.bookTitle}</h3>

            <p>
              Member: {book.memberName}
            </p>

            <p>
              Due Date: {book.dueDate}
            </p>

            <p>
              Days Late: {book.daysLate}
            </p>

          </div>

        ))}

        {overdueBooks.length === 0 && (
          <p>No overdue books.</p>
        )}

      </div>

    </div>
  )
}

export default Borrow