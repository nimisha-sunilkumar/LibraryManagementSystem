import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Categories() {
  const [categories, setCategories] = useState([])
  const [searchName, setSearchName] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const [categoryBooks, setCategoryBooks] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    description: ''
  })


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
        console.error(
          'Error fetching categories:',
          error
        )
      })
  }


  // ---------------------------------------
  // Load categories when page opens
  // ---------------------------------------

  useEffect(() => {
    fetchCategories()
  }, [])


  // ---------------------------------------
  // Reset form
  // ---------------------------------------

  const resetForm = () => {
    setNewCategory({
      categoryName: '',
      description: ''
    })

    setEditingCategoryId(null)
    setShowForm(false)
  }

// Get books for a category
const fetchCategoryBooks = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/Categories/${categoryId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch category books')
    }

    const data = await response.json()

    setCategoryBooks(prev => ({
      ...prev,
      [categoryId]: data.books || []
    }))

  } catch (error) {
    console.error(
      'Error fetching books for category:',
      error
    )

    setCategoryBooks(prev => ({
      ...prev,
      [categoryId]: []
    }))
  }
}
  // ---------------------------------------
  // Add category
  // ---------------------------------------

  const handleAddCategory = async (event) => {
    event.preventDefault()

    if (!newCategory.categoryName.trim()) {
      alert('Please enter a category name.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoryName:
              newCategory.categoryName.trim(),

            description:
              newCategory.description.trim()
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to add category'
        )
      }

      alert('Category added successfully!')

      resetForm()
      fetchCategories()

    } catch (error) {
      console.error(
        'Error adding category:',
        error
      )

      alert(
        `Failed to add category.\n\n${error.message}`
      )
    }
  }

// Show / hide category books
const toggleCategoryBooks = (categoryId) => {
  const isCurrentlyExpanded =
    expandedCategories[categoryId]

  if (!isCurrentlyExpanded) {
    if (!Object.prototype.hasOwnProperty.call(
      categoryBooks,
      categoryId
    )) {
      fetchCategoryBooks(categoryId)
    }
  }

  setExpandedCategories(prev => ({
    ...prev,
    [categoryId]: !isCurrentlyExpanded
  }))
}
  // ---------------------------------------
  // Edit category
  // ---------------------------------------

  const handleEditCategory = (category) => {
    setEditingCategoryId(
      category.categoryId
    )

    setNewCategory({
      categoryName:
        category.categoryName || '',

      description:
        category.description || ''
    })

    setShowForm(true)
  }


  // ---------------------------------------
  // Update category
  // ---------------------------------------

  const handleUpdateCategory = async (event) => {
    event.preventDefault()

    if (!newCategory.categoryName.trim()) {
      alert('Please enter a category name.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Categories/${editingCategoryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoryId: editingCategoryId,

            categoryName:
              newCategory.categoryName.trim(),

            description:
              newCategory.description.trim()
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to update category'
        )
      }

      alert('Category updated successfully!')

      resetForm()
      fetchCategories()

    } catch (error) {
      console.error(
        'Error updating category:',
        error
      )

      alert(
        `Failed to update category.\n\n${error.message}`
      )
    }
  }


  // ---------------------------------------
  // Delete category
  // ---------------------------------------

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/Categories/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(
          errorText || 'Failed to delete category'
        )
      }

      alert('Category deleted successfully!')

      fetchCategories()

    } catch (error) {
      console.error(
        'Error deleting category:',
        error
      )

      alert(
        `Failed to delete category.\n\n${error.message}`
      )
    }
  }


  // ---------------------------------------
  // Search categories
  // ---------------------------------------

  const filteredCategories =
    categories.filter(category =>
      category.categoryName
        ?.toLowerCase()
        .includes(searchName.toLowerCase())
    )


  // ---------------------------------------
  // Show all categories
  // ---------------------------------------

  const showAllCategories = () => {
    setSearchName('')
  }


  return (
    <div className="categories-page">


      {/* -------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------- */}

      <div className="page-header">

        <div>

          <h1>
            Categories
          </h1>

          <p>
            Manage the categories available
            in the library.
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
            : '+ Add Category'}
        </button>

      </div>


      {/* -------------------------------- */}
      {/* Add / Edit Form */}
      {/* -------------------------------- */}

      {showForm && (

        <form
          className="category-form"
          onSubmit={
            editingCategoryId
              ? handleUpdateCategory
              : handleAddCategory
          }
        >

          <h2>
            {editingCategoryId
              ? 'Edit Category'
              : 'Add New Category'}
          </h2>


          {/* Category Name */}

          <div className="form-group">

            <label>
              Category Name
            </label>

            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory.categoryName}
              onChange={(event) =>
                setNewCategory({
                  ...newCategory,
                  categoryName:
                    event.target.value
                })
              }
              required
            />

          </div>


          {/* Description */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Enter category description"
              value={newCategory.description}
              onChange={(event) =>
                setNewCategory({
                  ...newCategory,
                  description:
                    event.target.value
                })
              }
              rows="3"
            />

          </div>


          {/* Form Actions */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingCategoryId
                ? 'Update Category'
                : 'Save Category'}
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
          placeholder="Search by category name..."
          value={searchName}
          onChange={(event) =>
            setSearchName(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
            }
          }}
        />


        <button
          className="secondary-button"
          onClick={showAllCategories}
        >
          Show All
        </button>

      </div>

{/* -------------------------------- */}
{/* Categories List */}
{/* -------------------------------- */}

<div className="categories-list">

  {filteredCategories.map(category => {

    const isExpanded =
      expandedCategories[category.categoryId]

    const books =
      categoryBooks[category.categoryId]

    return (
      <div
        className="category-card"
        key={category.categoryId}
      >

        <h3>
          {category.categoryName}
        </h3>

        <p>
          Description:{' '}
          {category.description ||
            'No description'}
        </p>


        <div className="action-buttons">

          <button
            className="edit-button"
            onClick={() =>
              handleEditCategory(category)
            }
          >
            Edit
          </button>


          <button
            className="delete-button"
            onClick={() =>
              handleDeleteCategory(
                category.categoryId
              )
            }
          >
            Delete
          </button>


          <button
            className="primary-button"
            onClick={() =>
              toggleCategoryBooks(
                category.categoryId
              )
            }
          >
            {isExpanded
              ? 'Hide Books'
              : 'View Books'}
          </button>

        </div>


        {/* -------------------------------- */}
        {/* Books in Category */}
        {/* -------------------------------- */}

        {isExpanded && (

          <div className="category-books">

            <h4>
              Books in {category.categoryName}
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
                  No books assigned to this category.
                </p>
              )}


            {/* Books */}

            {books &&
              books.length > 0 && (

                <div className="category-book-list">

                  {books.map(book => (

                    <div
                      className="category-book-card"
                      key={book.bookId}
                    >

                      <h5>
                        {book.title}
                      </h5>

                      <p>
                        ISBN: {book.isbn}
                      </p>

                      <p>
                        Description:{' '}
                        {book.description ||
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

      {filteredCategories.length === 0 && (

        <div className="empty-books">

          <h3>
            No categories found
          </h3>

          <p>
            Try another search or add
            a new category.
          </p>

        </div>

      )}

    </div>
  )
}

export default Categories