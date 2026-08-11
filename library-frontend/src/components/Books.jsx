import { useEffect, useState } from 'react'

function Books() {
  const [books, setBooks] = useState([])
  const [searchTitle, setSearchTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBookId, setEditingBookId] = useState(null)

  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    description: '',
    publishedDate: '',
    totalCopies: 0,
    availableCopies: 0,
    categoryId: 0
  })

  // Reset form
  const resetForm = () => {
    setNewBook({
      title: '',
      isbn: '',
      description: '',
      publishedDate: '',
      totalCopies: 0,
      availableCopies: 0,
      categoryId: 0
    })

    setEditingBookId(null)
    setShowForm(false)
  }

  // Get all books
  const fetchBooks = () => {
    fetch('http://localhost:5213/api/Books')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }

        return response.json()
      })
      .then(data => {
        setBooks(data)
      })
      .catch(error => {
        console.error('Error fetching books:', error)
      })
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  // Add book
  const handleAddBook = async (event) => {
    event.preventDefault()

    if (
      !newBook.title.trim() ||
      !newBook.isbn.trim() ||
      !newBook.publishedDate ||
      newBook.totalCopies <= 0 ||
      newBook.availableCopies < 0
    ) {
      alert('Please enter valid book details.')
      return
    }

    if (newBook.availableCopies > newBook.totalCopies) {
      alert('Available copies cannot be greater than total copies.')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5213/api/Books',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newBook)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add book')
      }

      alert('Book added successfully!')

      resetForm()
      fetchBooks()
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Failed to add book.')
    }
  }

  // Update book
  const handleUpdateBook = async (event) => {
    event.preventDefault()

    if (
      !newBook.title.trim() ||
      !newBook.isbn.trim() ||
      !newBook.publishedDate
    ) {
      alert('Please enter valid book details.')
      return
    }

    if (newBook.availableCopies > newBook.totalCopies) {
      alert('Available copies cannot be greater than total copies.')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5213/api/Books/${editingBookId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newBook)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update book')
      }

      alert('Book updated successfully!')

      resetForm()
      fetchBooks()
    } catch (error) {
      console.error('Error updating book:', error)
      alert('Failed to update book.')
    }
  }

  // Delete book
  const handleDeleteBook = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5213/api/Books/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete book')
      }

      alert('Book deleted successfully!')

      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book.')
    }
  }

  // Search books
  const searchBooks = () => {
    if (!searchTitle.trim()) {
      fetchBooks()
      return
    }

    fetch(
      `http://localhost:5213/api/Books/search?title=${encodeURIComponent(searchTitle)}`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('No books found')
        }

        return response.json()
      })
      .then(data => {
        setBooks(data)
      })
      .catch(error => {
        console.error('Error searching books:', error)
        setBooks([])
      })
  }

  // Edit book
  const handleEditBook = (book) => {
    setEditingBookId(book.bookId)

    setNewBook({
      title: book.title,
      isbn: book.isbn,
      description: book.description || '',
      publishedDate: book.publishedDate
        ? book.publishedDate.substring(0, 10)
        : '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      categoryId: book.categoryId
    })

    setShowForm(true)
  }

  return (
    <div className="books-page">

      {/* Page Header */}

      <div className="page-header">
        <div>
          <h1>Books</h1>
          <p>Manage the books available in the library.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setShowForm(true)
            }
          }}
        >
          {showForm ? 'Cancel' : '+ Add Book'}
        </button>
      </div>


      {/* Add / Edit Form */}

      {showForm && (
        <form
          className="book-form"
          onSubmit={
            editingBookId
              ? handleUpdateBook
              : handleAddBook
          }
        >
          <h2>
            {editingBookId
              ? 'Edit Book'
              : 'Add New Book'}
          </h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Book Title</label>

              <input
                type="text"
                value={newBook.title}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    title: event.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>ISBN</label>

              <input
                type="text"
                value={newBook.isbn}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    isbn: event.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                value={newBook.description}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    description: event.target.value
                  })
                }
                rows="3"
              />
            </div>


            <div className="form-group">
              <label>Published Date</label>

              <input
                type="date"
                value={newBook.publishedDate}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    publishedDate: event.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>Category ID</label>

              <input
                type="number"
                min="1"
                value={newBook.categoryId}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    categoryId: Number(event.target.value)
                  })
                }
              />
            </div>


            <div className="form-group">
              <label>Total Copies</label>

              <input
                type="number"
                min="1"
                value={newBook.totalCopies}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    totalCopies: Number(event.target.value)
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>Available Copies</label>

              <input
                type="number"
                min="0"
                value={newBook.availableCopies}
                onChange={(event) =>
                  setNewBook({
                    ...newBook,
                    availableCopies: Number(event.target.value)
                  })
                }
                required
              />
            </div>

          </div>


          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingBookId
                ? 'Update Book'
                : 'Save Book'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      {/* Search */}

      <div className="search-section">

        <input
          type="text"
          placeholder="Search by book title..."
          value={searchTitle}
          onChange={(event) =>
            setSearchTitle(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              searchBooks()
            }
          }}
        />

        <button
          className="primary-button"
          onClick={searchBooks}
        >
          Search
        </button>

        <button
          className="secondary-button"
          onClick={() => {
            setSearchTitle('')
            fetchBooks()
          }}
        >
          Show All
        </button>

      </div>


      {/* Books Table */}

      <div className="books-table-container">

        <table className="books-table">

          <thead>
            <tr>
              <th>Title</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Published</th>
              <th>Total</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {books.map(book => (
              <tr key={book.bookId}>

                <td className="book-title">
                  {book.title}
                </td>

                <td>
                  {book.isbn}
                </td>

                <td>
                  {book.categoryName || book.category || 'N/A'}
                </td>

                <td>
                  {book.publishedDate
                    ? book.publishedDate.substring(0, 10)
                    : 'N/A'}
                </td>

                <td>
                  {book.totalCopies}
                </td>

                <td>
                  <span
                    className={
                      book.availableCopies === 0
                        ? 'stock unavailable'
                        : 'stock available'
                    }
                  >
                    {book.availableCopies}
                  </span>
                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEditBook(book)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteBook(book.bookId)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>


        {books.length === 0 && (
          <div className="empty-books">
            <h3>No books found</h3>
            <p>
              Try another search or add a new book.
            </p>
          </div>
        )}

      </div>

    </div>
  )
}

export default Books