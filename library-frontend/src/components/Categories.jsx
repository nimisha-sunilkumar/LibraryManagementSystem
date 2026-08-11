import { useEffect, useState } from 'react'

function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    description: ''
  })

  // Get all categories
  const fetchCategories = () => {
    fetch('http://localhost:5213/api/Categories')
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

  // Load categories when page opens
  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset form
  const resetForm = () => {
    setNewCategory({
      categoryName: '',
      description: ''
    })

    setEditingCategoryId(null)
    setShowForm(false)
  }

  // Add category
  const handleAddCategory = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(
        'http://localhost:5213/api/Categories',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCategory)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      alert('Category added successfully!')

      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  // Edit category
  const handleEditCategory = (category) => {
    setEditingCategoryId(category.categoryId)

    setNewCategory({
      categoryName: category.categoryName,
      description: category.description || ''
    })

    setShowForm(true)
  }

  // Update category
  const handleUpdateCategory = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(
        `http://localhost:5213/api/Categories/${editingCategoryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoryId: editingCategoryId,
            categoryName: newCategory.categoryName,
            description: newCategory.description
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      alert('Category updated successfully!')

      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  // Delete category
  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5213/api/Categories/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      alert('Category deleted successfully!')

      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div>
      <h1>Categories</h1>

      {/* Add / Cancel button */}
      <button
        onClick={() => {
          if (showForm) {
            resetForm()
          } else {
            setShowForm(true)
          }
        }}
      >
        {showForm ? 'Cancel' : 'Add Category'}
      </button>

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={
            editingCategoryId
              ? handleUpdateCategory
              : handleAddCategory
          }
        >
          <h2>
            {editingCategoryId
              ? 'Edit Category'
              : 'Add Category'}
          </h2>

          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.categoryName}
            onChange={(event) =>
              setNewCategory({
                ...newCategory,
                categoryName: event.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Description"
            value={newCategory.description}
            onChange={(event) =>
              setNewCategory({
                ...newCategory,
                description: event.target.value
              })
            }
          />

          <button type="submit">
            {editingCategoryId
              ? 'Update Category'
              : 'Save Category'}
          </button>

          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Categories list */}
      <div className="categories-list">
        {categories.map(category => (
          <div
            className="category-card"
            key={category.categoryId}
          >
            <h3>{category.categoryName}</h3>

            <p>
              Description: {category.description}
            </p>

            <button
              onClick={() =>
                handleEditCategory(category)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleDeleteCategory(category.categoryId)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p>No categories found.</p>
      )}
    </div>
  )
}

export default Categories