import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Authors() {
  const [authors, setAuthors] = useState([])
  const [searchName, setSearchName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAuthorId, setEditingAuthorId] = useState(null)

  // Stores books for each author
  const [authorBooks, setAuthorBooks] = useState({})

  // Stores which author cards are expanded
  const [expandedAuthors, setExpandedAuthors] = useState({})

  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: ''
  })


  // ---------------------------------------
  // Reset form
  // ---------------------------------------

  const resetForm = () => {
    setNewAuthor({
      name: '',
      email: ''
    })

    setEditingAuthorId(null)
    setShowForm(false)
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
  // Load authors when page opens
  // ---------------------------------------

  useEffect(() => {
    fetchAuthors()
  }, [])


  // ---------------------------------------
  // Get books for an author
  // ---------------------------------------

 const fetchAuthorBooks = async (authorId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/Authors/${authorId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch author details')
    }

    const data = await response.json()

    setAuthorBooks(prev => ({
      ...prev,
      [authorId]: data.books || []
    }))

  } catch (error) {
    console.error(
      'Error fetching books for author:',
      error
    )

    setAuthorBooks(prev => ({
      ...prev,
      [authorId]: []
    }))
  }
}


  // ---------------------------------------
  // Show / hide author books
  // ---------------------------------------

  const toggleAuthorBooks = (authorId) => {
    const isCurrentlyExpanded =
      expandedAuthors[authorId]

    if (!isCurrentlyExpanded) {

      // Fetch books only if we haven't
      // already loaded them
      if (!authorBooks.hasOwnProperty(authorId)) {
        fetchAuthorBooks(authorId)
      }
    }

    setExpandedAuthors(prev => ({
      ...prev,
      [authorId]: !isCurrentlyExpanded
    }))
  }


  // ---------------------------------------
  // Add author
  // ---------------------------------------

  const handleAddAuthor = async (event) => {
    event.preventDefault()

    if (
      !newAuthor.name.trim() ||
      !newAuthor.email.trim()
    ) {
      alert('Please enter author name and email.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Authors`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAuthor)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add author')
      }

      alert('Author added successfully!')

      resetForm()
      fetchAuthors()

    } catch (error) {
      console.error(
        'Error adding author:',
        error
      )

      alert('Failed to add author.')
    }
  }


  // ---------------------------------------
  // Update author
  // ---------------------------------------

  const handleUpdateAuthor = async (event) => {
    event.preventDefault()

    if (
      !newAuthor.name.trim() ||
      !newAuthor.email.trim()
    ) {
      alert('Please enter author name and email.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Authors/${editingAuthorId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAuthor)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update author')
      }

      alert('Author updated successfully!')

      resetForm()
      fetchAuthors()

    } catch (error) {
      console.error(
        'Error updating author:',
        error
      )

      alert('Failed to update author.')
    }
  }


  // ---------------------------------------
  // Start editing
  // ---------------------------------------

  const handleEditAuthor = (author) => {
    setEditingAuthorId(author.authorId)

    setNewAuthor({
      name: author.name,
      email: author.email
    })

    setShowForm(true)
  }


  // ---------------------------------------
  // Delete author
  // ---------------------------------------

  const handleDeleteAuthor = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this author?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Authors/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete author')
      }

      alert('Author deleted successfully!')

      // Remove deleted author's books
      setAuthorBooks(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })

      // Remove deleted author from expanded list
      setExpandedAuthors(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })

      fetchAuthors()

    } catch (error) {
      console.error(
        'Error deleting author:',
        error
      )

      alert('Failed to delete author.')
    }
  }


  // ---------------------------------------
  // Search authors
  // ---------------------------------------

  const filteredAuthors = authors.filter(author =>
    author.name
      .toLowerCase()
      .includes(searchName.toLowerCase())
  )


  return (
    <div className="authors-page">

      {/* -------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------- */}

      <div className="page-header">

        <div>
          <h1>Authors</h1>

          <p>
            Manage the authors available in the library.
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
            : '+ Add Author'}
        </button>

      </div>


      {/* -------------------------------- */}
      {/* Add / Edit Form */}
      {/* -------------------------------- */}

      {showForm && (

        <form
          className="author-form"
          onSubmit={
            editingAuthorId
              ? handleUpdateAuthor
              : handleAddAuthor
          }
        >

          <h2>
            {editingAuthorId
              ? 'Edit Author'
              : 'Add New Author'}
          </h2>


          {/* Author Name */}

          <div className="form-group">

            <label>
              Author Name
            </label>

            <input
              type="text"
              placeholder="Enter author name"
              value={newAuthor.name}
              onChange={(event) =>
                setNewAuthor({
                  ...newAuthor,
                  name: event.target.value
                })
              }
              required
            />

          </div>


          {/* Author Email */}

          <div className="form-group">

            <label>
              Author Email
            </label>

            <input
              type="email"
              placeholder="Enter author email"
              value={newAuthor.email}
              onChange={(event) =>
                setNewAuthor({
                  ...newAuthor,
                  email: event.target.value
                })
              }
              required
            />

          </div>


          {/* Form Actions */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingAuthorId
                ? 'Update Author'
                : 'Save Author'}
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

        <input
          type="text"
          placeholder="Search by author name..."
          value={searchName}
          onChange={(event) =>
            setSearchName(event.target.value)
          }
        />

        <button
          className="secondary-button"
          onClick={() =>
            setSearchName('')
          }
        >
          Show All
        </button>

      </div>


      {/* -------------------------------- */}
      {/* Authors List */}
      {/* -------------------------------- */}

      <div className="authors-list">

        {filteredAuthors.map(author => {

          const isExpanded =
            expandedAuthors[author.authorId]

          const books =
            authorBooks[author.authorId]

          return (

            <div
              className="author-card"
              key={author.authorId}
            >

              {/* Author Information */}

              <h3>
                {author.name}
              </h3>

              <p>
                Email: {author.email}
              </p>


              {/* Author Actions */}

              <div className="action-buttons">

                <button
                  className="edit-button"
                  onClick={() =>
                    handleEditAuthor(author)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDeleteAuthor(
                      author.authorId
                    )
                  }
                >
                  Delete
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    toggleAuthorBooks(
                      author.authorId
                    )
                  }
                >
                  {isExpanded
                    ? 'Hide Books'
                    : 'View Books'}
                </button>

              </div>


              {/* -------------------------------- */}
              {/* Books by Author */}
              {/* -------------------------------- */}

              {isExpanded && (

                <div className="author-books">

                  <h4>
                    Books by {author.name}
                  </h4>


                  {/* Loading */}

                  {books === undefined && (

                    <p>
                      Loading books...
                    </p>

                  )}


                  {/* No Books */}

                  {books &&
                    books.length === 0 && (

                      <p>
                        No books assigned to this author.
                      </p>

                    )}


                  {/* Books */}

                  {books &&
                    books.length > 0 && (

                      <div className="author-book-list">

                        {books.map(book => (

                          <div
                            className="author-book-card"
                            key={book.bookId}
                          >

                            <h5>
                              {book.title}
                            </h5>

                            <p>
                              ISBN: {book.isbn}
                            </p>

                            <p>
                              Category:{' '}
                              {book.categoryName ||
                                'N/A'}
                            </p>

                            <p>
                              Published:{' '}
                              {book.publishedDate
                                ? book.publishedDate.substring(
                                    0,
                                    10
                                  )
                                : 'N/A'}
                            </p>

                            <p>
                              Available:{' '}
                              {book.availableCopies}
                              {' / '}
                              {book.totalCopies}
                            </p>

                          </div>

                        ))}

                      </div>

                    )}

                </div>

              )}

            </div>

          )
        })}

      </div>


      {/* -------------------------------- */}
      {/* Empty State */}
      {/* -------------------------------- */}

      {filteredAuthors.length === 0 && (

        <div className="empty-books">

          <h3>
            No authors found
          </h3>

          <p>
            Try another search or add
            a new author.
          </p>

        </div>

      )}

    </div>
  )
}

export default Authors