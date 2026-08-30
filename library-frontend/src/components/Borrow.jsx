import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Borrow() {

  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [borrows, setBorrows] = useState([])
  const [overdueBooks, setOverdueBooks] = useState([])

  const [userRole, setUserRole] = useState('')
  const [currentMemberId, setCurrentMemberId] = useState(null)

  const [borrowData, setBorrowData] = useState({
    bookId: '',
    memberId: '',
    borrowDate: '',
    dueDate: ''
  })


  // =========================================================
  // GET JWT TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem('token')
  }


  // =========================================================
  // AUTHENTICATED FETCH
  // =========================================================

  const authFetch = async (url, options = {}) => {

    const token = getToken()

    const headers = {
      ...(options.headers || {})
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(url, {
      ...options,
      headers
    })
  }


  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const fetchCurrentUser = async () => {

    try {

      const response = await authFetch(
        `${API_URL}/api/Auth/me`
      )

      if (!response.ok) {
        throw new Error(
          'Failed to get current user'
        )
      }

      const data = await response.json()

      console.log(
        'Current user:',
        data
      )

      setUserRole(data.role)

      if (data.role === 'User') {

        setCurrentMemberId(
          data.memberId
        )

        setBorrowData(prev => ({
          ...prev,
          memberId: data.memberId
        }))
      }

    } catch (error) {

      console.error(
        'Error fetching current user:',
        error
      )
    }
  }


  // =========================================================
  // GET BOOKS
  // =========================================================

  const fetchBooks = async () => {

    try {

      const response = await authFetch(
        `${API_URL}/api/Books`
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch books'
        )
      }

      const data = await response.json()

      setBooks(data)

    } catch (error) {

      console.error(
        'Error fetching books:',
        error
      )
    }
  }


  // =========================================================
  // GET MEMBERS
  // ADMIN ONLY
  // =========================================================

  const fetchMembers = async () => {

    try {

      const response = await authFetch(
        `${API_URL}/api/Members`
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch members'
        )
      }

      const data = await response.json()

      setMembers(data)

    } catch (error) {

      console.error(
        'Error fetching members:',
        error
      )
    }
  }


  // =========================================================
  // GET BORROW RECORDS
  // ADMIN  → /api/Borrows
  // USER   → /api/Borrows/my
  // =========================================================

  const fetchBorrows = async () => {

    try {

      const endpoint =
        userRole === 'Admin'
          ? `${API_URL}/api/Borrows`
          : `${API_URL}/api/Borrows/my`

      const response =
        await authFetch(endpoint)

      if (!response.ok) {
        throw new Error(
          'Failed to fetch borrowing records'
        )
      }

      const data =
        await response.json()

      setBorrows(data)

    } catch (error) {

      console.error(
        'Error fetching borrows:',
        error
      )

      setBorrows([])
    }
  }


  // =========================================================
  // GET OVERDUE BOOKS
  // ADMIN ONLY
  // =========================================================

  const fetchOverdueBooks = async () => {

    if (userRole !== 'Admin') {
      return
    }

    try {

      const response =
        await authFetch(
          `${API_URL}/api/Borrows/overdue`
        )

      if (response.status === 404) {

        setOverdueBooks([])

        return
      }

      if (!response.ok) {

        throw new Error(
          'Failed to fetch overdue books'
        )
      }

      const data =
        await response.json()

      setOverdueBooks(data)

    } catch (error) {

      console.error(
        'Error fetching overdue books:',
        error
      )

      setOverdueBooks([])
    }
  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchCurrentUser()
    fetchBooks()

  }, [])


  // =========================================================
  // LOAD ROLE-SPECIFIC DATA
  // =========================================================

  useEffect(() => {

    if (!userRole) {
      return
    }

    fetchBorrows()

    if (userRole === 'Admin') {

      fetchMembers()
      fetchOverdueBooks()
    }

  }, [userRole])


  // =========================================================
  // BORROW BOOK
  // =========================================================

  const handleBorrowBook = async (event) => {

    event.preventDefault()


    // =======================================================
    // USER VALIDATION
    // =======================================================

    if (userRole === 'User') {

      if (
        !borrowData.bookId ||
        !borrowData.borrowDate ||
        !borrowData.dueDate
      ) {

        alert(
          'Please fill in all required fields.'
        )

        return
      }
    }


    // =======================================================
    // ADMIN VALIDATION
    // =======================================================

    if (userRole === 'Admin') {

      if (
        !borrowData.bookId ||
        !borrowData.memberId ||
        !borrowData.borrowDate ||
        !borrowData.dueDate
      ) {

        alert(
          'Please fill in all fields.'
        )

        return
      }
    }


    // =======================================================
    // DATE VALIDATION
    // =======================================================

    if (
      borrowData.dueDate <
      borrowData.borrowDate
    ) {

      alert(
        'Due date cannot be before the borrow date.'
      )

      return
    }


    // =======================================================
    // CREATE REQUEST
    // =======================================================

    try {

      const requestData = {

        bookId:
          Number(
            borrowData.bookId
          ),

        memberId:
          userRole === 'Admin'
            ? Number(
                borrowData.memberId
              )
            : Number(
                currentMemberId
              ),

        borrowDate:
          borrowData.borrowDate,

        dueDate:
          borrowData.dueDate
      }


      console.log(
        'Borrow request:',
        requestData
      )


      // =====================================================
      // SEND REQUEST
      // =====================================================

      const response =
        await authFetch(
          `${API_URL}/api/Borrows`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                requestData
              )
          }
        )


      // =====================================================
      // READ RESPONSE
      // =====================================================

      const text =
        await response.text()

      let data

      try {

        data =
          JSON.parse(text)

      } catch {

        data = text
      }


      // =====================================================
      // HANDLE ERROR
      // =====================================================

      if (!response.ok) {

        alert(
          typeof data === 'string'
            ? data
            : 'Failed to borrow the book.'
        )

        return
      }


      // =====================================================
      // SUCCESS
      // =====================================================

      alert(
        'Book borrowed successfully!'
      )


      setBorrowData({
        bookId: '',

        memberId:
          userRole === 'User'
            ? currentMemberId
            : '',

        borrowDate: '',

        dueDate: ''
      })


      await fetchBooks()

      await fetchBorrows()

      if (userRole === 'Admin') {
        await fetchOverdueBooks()
      }

    } catch (error) {

      console.error(
        'Error borrowing book:',
        error
      )

      alert(
        'Something went wrong while borrowing the book.'
      )
    }
  }


  // =========================================================
  // RETURN BOOK
  // ADMIN ONLY
  // =========================================================

  const handleReturnBook = async (
    borrowId
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to return this book?'
      )


    if (!confirmed) {
      return
    }


    try {

      const returnData = {

        borrowId:

          borrowId,

        returnDate:

          new Date()
            .toISOString()
            .split('T')[0]
      }


      const response =
        await authFetch(
          `${API_URL}/api/Borrows/return`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                returnData
              )
          }
        )


      const text =
        await response.text()

      let data

      try {

        data =
          JSON.parse(text)

      } catch {

        data = text
      }


      if (!response.ok) {

        alert(
          typeof data === 'string'
            ? data
            : 'Failed to return the book.'
        )

        return
      }


      alert(
        'Book returned successfully!'
      )


      await fetchBooks()

      await fetchBorrows()

      await fetchOverdueBooks()

    } catch (error) {

      console.error(
        'Error returning book:',
        error
      )

      alert(
        'Something went wrong while returning the book.'
      )
    }
  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div>

      <h1>
        Borrow & Return
      </h1>


      {/* =====================================================
          BORROW BOOK
      ====================================================== */}

      <div className="borrow-form">

        <h2>
          Borrow a Book
        </h2>


        <form
          onSubmit={
            handleBorrowBook
          }
        >

          {/* BOOK */}

          <label>
            Book
          </label>

          <select
            value={
              borrowData.bookId
            }

            onChange={
              (event) =>
                setBorrowData({
                  ...borrowData,
                  bookId:
                    event.target.value
                })
            }
          >

            <option value="">
              Select a book
            </option>


            {books
              .filter(
                book =>
                  book.availableCopies > 0
              )
              .map(book => (

                <option
                  key={
                    book.bookId
                  }
                  value={
                    book.bookId
                  }
                >

                  {book.title}

                  {' — Available: '}

                  {
                    book.availableCopies
                  }

                </option>

              ))}

          </select>


          <br />


          {/* =================================================
              MEMBER
              ADMIN ONLY
          ================================================== */}

          {userRole === 'Admin' && (

            <>

              <label>
                Member
              </label>

              <select
                value={
                  borrowData.memberId
                }

                onChange={
                  (event) =>
                    setBorrowData({
                      ...borrowData,

                      memberId:
                        event.target.value
                    })
                }
              >

                <option value="">
                  Select a member
                </option>


                {members
                  .filter(
                    member =>
                      member.isActive
                  )
                  .map(member => (

                    <option
                      key={
                        member.memberId
                      }

                      value={
                        member.memberId
                      }
                    >

                      {member.fullName}

                      {' — '}

                      {
                        member.admissionNumber
                      }

                    </option>

                  ))}

              </select>

              <br />

            </>
          )}


          {/* =================================================
              USER INFORMATION
          ================================================== */}

          {userRole === 'User' && (

            <p>
              You are borrowing this
              book for your own library
              account.
            </p>

          )}


          {/* BORROW DATE */}

          <label>
            Borrow Date
          </label>

          <input
            type="date"

            value={
              borrowData.borrowDate
            }

            onChange={
              (event) =>
                setBorrowData({
                  ...borrowData,

                  borrowDate:
                    event.target.value
                })
            }
          />


          <br />


          {/* DUE DATE */}

          <label>
            Due Date
          </label>

          <input
            type="date"

            value={
              borrowData.dueDate
            }

            min={
              borrowData.borrowDate
            }

            onChange={
              (event) =>
                setBorrowData({
                  ...borrowData,

                  dueDate:
                    event.target.value
                })
            }
          />


          <br />


          <button
            type="submit"
          >
            Borrow Book
          </button>

        </form>

      </div>


      {/* =====================================================
          BORROWING RECORDS
      ====================================================== */}

      <div className="borrow-list">

        <h2>

          {userRole === 'Admin'
            ? 'Borrowing Records'
            : 'My Borrowing History'}

        </h2>


        {borrows.map(
          borrow => (

            <div
              className="borrow-card"
              key={
                borrow.borrowId
              }
            >

              <h3>
                {borrow.bookTitle}
              </h3>


              <p>
                Member:
                {' '}
                {borrow.memberName}
              </p>


              <p>
                Borrow Date:
                {' '}

                {new Date(
                  borrow.borrowDate
                ).toLocaleDateString()}
              </p>


              <p>
                Due Date:
                {' '}

                {new Date(
                  borrow.dueDate
                ).toLocaleDateString()}
              </p>


              <p>

                Return Date:
                {' '}

                {borrow.returnDate

                  ? new Date(
                      borrow.returnDate
                    ).toLocaleDateString()

                  : 'Not returned'}

              </p>


              <p>
                Status:
                {' '}
                {borrow.status}
              </p>


              {/* ADMIN ONLY */}

              {userRole === 'Admin' &&
                borrow.status !== 'Returned' && (

                  <button
                    onClick={() =>
                      handleReturnBook(
                        borrow.borrowId
                      )
                    }
                  >
                    Return Book
                  </button>

                )}

            </div>

          )
        )}


        {borrows.length === 0 && (

          <p>
            No borrowing records found.
          </p>

        )}

      </div>


      {/* =====================================================
          OVERDUE BOOKS
          ADMIN ONLY
      ====================================================== */}

      {userRole === 'Admin' && (

        <div className="overdue-list">

          <h2>
            Overdue Books
          </h2>


          {overdueBooks.map(
            book => (

              <div
                className="overdue-card"
                key={
                  book.borrowId
                }
              >

                <h3>
                  {book.bookTitle}
                </h3>


                <p>
                  Member:
                  {' '}
                  {book.memberName}
                </p>


                <p>
                  Due Date:
                  {' '}

                  {new Date(
                    book.dueDate
                  ).toLocaleDateString()}
                </p>


                <p>
                  Days Late:
                  {' '}
                  {book.daysLate}
                </p>

              </div>

            )
          )}


          {overdueBooks.length === 0 && (

            <p>
              No overdue books.
            </p>

          )}

        </div>

      )}

    </div>
  )
}

export default Borrow