import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Books() {
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])

  const [searchText, setSearchText] = useState('')
  const [searchType, setSearchType] = useState('title')

  const [showForm, setShowForm] = useState(false)
  const [editingBookId, setEditingBookId] = useState(null)

  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    description: '',
    publishedDate: '',
    totalCopies: 0,
    availableCopies: 0,
    categoryId: 0,
    authorId: 0
  })


  // ---------------------------------------
  // Reset form
  // ---------------------------------------

  const resetForm = () => {
    setNewBook({
      title: '',
      isbn: '',
      description: '',
      publishedDate: '',
      totalCopies: 0,
      availableCopies: 0,
      categoryId: 0,
      authorId: 0
    })

    setEditingBookId(null)
    setShowForm(false)
  }


  // ---------------------------------------
  // Get all books
  // ---------------------------------------

  const fetchBooks = () => {
    fetch(`${API_URL}/api/Books`)
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


  // ---------------------------------------
  // Get all authors
  // ---------------------------------------

  const fetchAuthors = () => {
    fetch(`${API_URL}/api/Authors`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch authors')
        }

        return response.json()
      })
      .then(data => {
        setAuthors(data)
      })
      .catch(error => {
        console.error('Error fetching authors:', error)
      })
  }


  // ---------------------------------------
  // Get all categories
  // ---------------------------------------

  const fetchCategories = () => {
    fetch(`${API_URL}/api/Categories`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        return response.json()
      })
      .then(data => {
        setCategories(data)
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
      })
  }


  // ---------------------------------------
  // Load data when page opens
  // ---------------------------------------

  useEffect(() => {
    fetchBooks()
    fetchAuthors()
    fetchCategories()
  }, [])


  // ---------------------------------------
  // Add book
  // ---------------------------------------

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
      alert(
        'Available copies cannot be greater than total copies.'
      )
      return
    }

    if (!newBook.categoryId) {
      alert('Please select a category.')
      return
    }

    if (!newBook.authorId) {
      alert('Please select an author.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/Books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newBook.title,
          isbn: newBook.isbn,
          description: newBook.description,
          publishedDate: newBook.publishedDate,
          totalCopies: newBook.totalCopies,
          categoryId: newBook.categoryId,
          authorId: newBook.authorId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(errorText || 'Failed to add book')
      }

      alert('Book added successfully!')

      resetForm()
      fetchBooks()

    } catch (error) {
      console.error('Error adding book:', error)

      alert(
        `Failed to add book.\n\n${error.message}`
      )
    }
  }


  // ---------------------------------------
  // Update book
  // ---------------------------------------

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
      alert(
        'Available copies cannot be greater than total copies.'
      )
      return
    }

    if (!newBook.categoryId) {
      alert('Please select a category.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Books/${editingBookId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newBook.title,
            isbn: newBook.isbn,
            description: newBook.description,
            publishedDate: newBook.publishedDate,
            totalCopies: newBook.totalCopies,
            categoryId: newBook.categoryId,
            authorId: newBook.authorId
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to update book'
        )
      }

      alert('Book updated successfully!')

      resetForm()
      fetchBooks()

    } catch (error) {
      console.error('Error updating book:', error)

      alert(
        `Failed to update book.\n\n${error.message}`
      )
    }
  }


  // ---------------------------------------
  // Delete book
  // ---------------------------------------

  const handleDeleteBook = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Books/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to delete book'
        )
      }

      alert('Book deleted successfully!')

      fetchBooks()

    } catch (error) {
      console.error('Error deleting book:', error)

      alert(
        `Failed to delete book.\n\n${error.message}`
      )
    }
  }


  // ---------------------------------------
// Search books
// ---------------------------------------

const searchBooks = () => {
  if (!searchText.trim()) {
    fetchBooks()
    return
  }

  let url = ''

  if (searchType === 'title') {
    url =
      `${API_URL}/api/Books/search?title=` +
      encodeURIComponent(searchText.trim())
  }

  else if (searchType === 'author') {
    url =
      `${API_URL}/api/Books/author/` +
      encodeURIComponent(searchText.trim())
  }

  else if (searchType === 'category') {
    url =
      `${API_URL}/api/Books/category/` +
      encodeURIComponent(searchText.trim())
  }

  fetch(url)
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


  // ---------------------------------------
  // Show all books
  // ---------------------------------------

  const showAllBooks = () => {
    setSearchText('')
    fetchBooks()
  }


  // ---------------------------------------
  // Edit book
  // ---------------------------------------

  const handleEditBook = (book) => {
    setEditingBookId(book.bookId)

    // Find author ID using author name
    const selectedAuthor = authors.find(
      author =>
        author.name?.toLowerCase() ===
        book.authorName?.toLowerCase()
    )

    setNewBook({
      title: book.title || '',
      isbn: book.isbn || '',
      description: book.description || '',

      publishedDate: book.publishedDate
        ? book.publishedDate.substring(0, 10)
        : '',

      totalCopies: book.totalCopies || 0,
      availableCopies: book.availableCopies || 0,

      categoryId: book.categoryId || 0,

      authorId: selectedAuthor
        ? selectedAuthor.authorId
        : 0
    })

    setShowForm(true)
  }


  return (
    <div className="books-page">

      {/* -------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------- */}

      <div className="page-header">

        <div>
          <h1>Books</h1>

          <p>
            Manage the books available in the library.
          </p>
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
          {showForm
            ? 'Cancel'
            : '+ Add Book'}
        </button>

      </div>


      {/* -------------------------------- */}
      {/* Add / Edit Form */}
      {/* -------------------------------- */}

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


            {/* Book Title */}

            <div className="form-group">

              <label>
                Book Title
              </label>

              <input
                type="text"
                value={newBook.title}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    title: event.target.value
                  })
                }

                required
              />

            </div>


            {/* ISBN */}

            <div className="form-group">

              <label>
                ISBN
              </label>

              <input
                type="text"
                value={newBook.isbn}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    isbn: event.target.value
                  })
                }

                required
              />

            </div>


            {/* Description */}

            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                value={newBook.description}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    description: event.target.value
                  })
                }

                rows="3"
              />

            </div>


            {/* Published Date */}

            <div className="form-group">

              <label>
                Published Date
              </label>

              <input
                type="date"
                value={newBook.publishedDate}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    publishedDate:
                      event.target.value
                  })
                }

                required
              />

            </div>


            {/* Author */}

            <div className="form-group">

              <label>
                Author
              </label>

              <select
                value={newBook.authorId}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    authorId:
                      Number(event.target.value)
                  })
                }

                required
              >

                <option value={0}>
                  Select Author
                </option>

                {authors.map(author => (

                  <option
                    key={author.authorId}
                    value={author.authorId}
                  >
                    {author.name}
                  </option>

                ))}

              </select>

            </div>


            {/* Category */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={newBook.categoryId}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    categoryId:
                      Number(event.target.value)
                  })
                }

                required
              >

                <option value={0}>
                  Select Category
                </option>

                {categories.map(category => (

                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </option>

                ))}

              </select>

            </div>


            {/* Total Copies */}

            <div className="form-group">

              <label>
                Total Copies
              </label>

              <input
                type="number"
                min="1"
                value={newBook.totalCopies}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    totalCopies:
                      Number(event.target.value)
                  })
                }

                required
              />

            </div>


            {/* Available Copies */}

            <div className="form-group">

              <label>
                Available Copies
              </label>

              <input
                type="number"
                min="0"
                value={newBook.availableCopies}

                onChange={event =>
                  setNewBook({
                    ...newBook,
                    availableCopies:
                      Number(event.target.value)
                  })
                }

                required
              />

            </div>

          </div>


          {/* Form Buttons */}

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


      {/* -------------------------------- */}
{/* Search */}
{/* -------------------------------- */}

<div className="search-section">

  <select
    value={searchType}
    onChange={(event) => {
      setSearchType(event.target.value)
      setSearchText('')
    }}
  >
    <option value="title">Search by Title</option>
    <option value="author">Search by Author</option>
    <option value="category">Search by Category</option>
  </select>

  <input
    type="text"
    placeholder={
      searchType === 'title'
        ? 'Enter book title...'
        : searchType === 'author'
        ? 'Enter author name...'
        : 'Enter category name...'
    }
    value={searchText}
    onChange={(event) =>
      setSearchText(event.target.value)
    }
    onKeyDown={(event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        searchBooks()
      }
    }}
  />

  <button
    type="button"
    className="primary-button"
    onClick={searchBooks}
  >
    Search
  </button>

  <button
    type="button"
    className="secondary-button"
    onClick={showAllBooks}
  >
    Show All
  </button>

</div>

      {/* -------------------------------- */}
      {/* Books Table */}
      {/* -------------------------------- */}

      <div className="books-table-container">

        <table className="books-table">

          <thead>

            <tr>

              <th>
                Title
              </th>

              <th>
                ISBN
              </th>

              <th>
                Author
              </th>

              <th>
                Category
              </th>

              <th>
                Published
              </th>

              <th>
                Total
              </th>

              <th>
                Available
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {books.map(book => (

              <tr
                key={book.bookId}
              >

                <td className="book-title">
                  {book.title}
                </td>

                <td>
                  {book.isbn}
                </td>

                <td>
                  {book.authorName || 'Unknown'}
                </td>

                <td>
                  {book.categoryName ||
                    book.category ||
                    'N/A'}
                </td>

                <td>
                  {book.publishedDate
                    ? book.publishedDate.substring(
                        0,
                        10
                      )
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
                        handleDeleteBook(
                          book.bookId
                        )
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


        {/* Empty State */}

        {books.length === 0 && (

          <div className="empty-books">

            <h3>
              No books found
            </h3>

            <p>
              Try another search or add
              a new book.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}

export default Books
