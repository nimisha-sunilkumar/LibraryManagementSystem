import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function Categories() {

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ============================================================
  // GET CATEGORIES FROM DATABASE
  // ============================================================

  useEffect(() => {

    fetch(`${API_URL}/api/Categories`)

      .then(response => {

        if (!response.ok) {
          throw new Error(
            'Failed to load categories.'
          )
        }

        return response.json()

      })

      .then(data => {

        setCategories(data)
        setLoading(false)

      })

      .catch(error => {

        console.error(
          'Error loading categories:',
          error
        )

        setError(
          'Unable to load categories.'
        )

        setLoading(false)

      })

  }, [])


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="public-page">

        <section className="public-page-header">

          <p>
            EXPLORE OUR COLLECTION
          </p>

          <h1>
            Book Categories
          </h1>

          <p>
            Loading categories...
          </p>

        </section>

      </div>

    )

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="public-page">

        <section className="public-page-header">

          <p>
            EXPLORE OUR COLLECTION
          </p>

          <h1>
            Book Categories
          </h1>

          <p className="public-books-error">
            {error}
          </p>

        </section>

      </div>

    )

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="public-page">


      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <section className="public-page-header">

        <p>
          EXPLORE OUR COLLECTION
        </p>

        <h1>
          Book Categories
        </h1>

        <p>
          Explore books from different subjects
          and categories.
        </p>

      </section>


      {/* ======================================================
          CATEGORY CARDS
      ======================================================= */}

      {categories.length === 0 ? (

        <div className="no-public-books">

          <h2>
            No categories available
          </h2>

          <p>
            Categories will appear here when they
            are added to the library.
          </p>

        </div>

      ) : (

        <section className="categories-grid">

          {categories.map(category => (

            <div
              className="category-card"
              key={category.categoryId}
            >


              {/* CATEGORY ICON */}

              <div className="category-icon">
                📚
              </div>


              {/* CATEGORY NAME */}

              <h2>
                {category.categoryName}
              </h2>


              {/* DESCRIPTION */}

              <p>

                {category.description ||
                  'Explore books from this category.'}

              </p>


              {/* EXPLORE BOOKS */}

              <Link
                to={`/books?category=${encodeURIComponent(
                  category.categoryName
                )}`}
                className="category-explore-link"
              >
                Explore Books →
              </Link>

            </div>

          ))}

        </section>

      )}

    </div>

  )

}

export default Categories