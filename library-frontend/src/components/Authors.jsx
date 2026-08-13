import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL

function Authors() {
  const [authors, setAuthors] = useState([])
  const [searchName, setSearchName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAuthorId, setEditingAuthorId] = useState(null)

  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: ''
  })

  // Reset form
  const resetForm = () => {
    setNewAuthor({
      name: '',
      email: ''
    })

    setEditingAuthorId(null)
    setShowForm(false)
  }

  // Get all authors
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

  // Load authors when page opens
  useEffect(() => {
    fetchAuthors()
  }, [])

  // Add author
  const handleAddAuthor = async (event) => {
    event.preventDefault()

    if (!newAuthor.name.trim() || !newAuthor.email.trim()) {
      alert('Please enter author name and email.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/Authors`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newAuthor)
})

      if (!response.ok) {
        throw new Error('Failed to add author')
      }

      alert('Author added successfully!')

      resetForm()
      fetchAuthors()
    } catch (error) {
      console.error('Error adding author:', error)
      alert('Failed to add author.')
    }
  }

  // Update author
  const handleUpdateAuthor = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API_URL}/api/Authors/${editingAuthorId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newAuthor)
})

      if (!response.ok) {
        throw new Error('Failed to update author')
      }

      alert('Author updated successfully!')

      resetForm()
      fetchAuthors()
    } catch (error) {
      console.error('Error updating author:', error)
      alert('Failed to update author.')
    }
  }

  // Start editing
  const handleEditAuthor = (author) => {
    setEditingAuthorId(author.authorId)

    setNewAuthor({
      name: author.name,
      email: author.email
    })

    setShowForm(true)
  }

  // Delete author
  const handleDeleteAuthor = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this author?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/Authors/${id}`, {
  method: 'DELETE'
})

      if (!response.ok) {
        throw new Error('Failed to delete author')
      }

      alert('Author deleted successfully!')

      fetchAuthors()
    } catch (error) {
      console.error('Error deleting author:', error)
      alert('Failed to delete author.')
    }
  }

  // Search authors on frontend
  const filteredAuthors = authors.filter(author =>
    author.name
      .toLowerCase()
      .includes(searchName.toLowerCase())
  )

  return (
    <div>
      <h1>Authors</h1>

      {/* Add Author button */}
      <button
        onClick={() => {
          if (showForm) {
            resetForm()
          } else {
            setShowForm(true)
          }
        }}
      >
        {showForm ? 'Cancel' : 'Add Author'}
      </button>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={
            editingAuthorId
              ? handleUpdateAuthor
              : handleAddAuthor
          }
        >
          <h2>
            {editingAuthorId
              ? 'Edit Author'
              : 'Add Author'}
          </h2>

          <input
            type="text"
            placeholder="Author Name"
            value={newAuthor.name}
            onChange={(event) =>
              setNewAuthor({
                ...newAuthor,
                name: event.target.value
              })
            }
          />

          <input
            type="email"
            placeholder="Author Email"
            value={newAuthor.email}
            onChange={(event) =>
              setNewAuthor({
                ...newAuthor,
                email: event.target.value
              })
            }
          />

          <button type="submit">
            {editingAuthorId
              ? 'Update Author'
              : 'Save Author'}
          </button>

          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by author name..."
          value={searchName}
          onChange={(event) =>
            setSearchName(event.target.value)
          }
        />

        <button
          onClick={() => setSearchName('')}
        >
          Show All
        </button>
      </div>

      {/* Authors list */}
      <div className="authors-list">
        {filteredAuthors.map(author => (
          <div
            className="author-card"
            key={author.authorId}
          >
            <h3>{author.name}</h3>

            <p>
              Email: {author.email}
            </p>

            <button
              onClick={() =>
                handleEditAuthor(author)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleDeleteAuthor(author.authorId)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {filteredAuthors.length === 0 && (
        <p>No authors found.</p>
      )}
    </div>
  )
}

export default Authors