import { Link } from 'react-router-dom'

function Categories() {
  const categories = [
    {
      name: 'Fiction',
      description: 'Stories, novels and imaginative works for every reader.'
    },
    {
      name: 'Technology',
      description: 'Books about programming, software development and technology.'
    },
    {
      name: 'Science',
      description: 'Explore books covering science, discovery and innovation.'
    },
    {
      name: 'Biography',
      description: 'Discover the lives and achievements of inspiring people.'
    },
    {
      name: 'Self Development',
      description: 'Books to help you learn, grow and improve yourself.'
    },
    {
      name: 'Education',
      description: 'Learning resources and educational books for students.'
    }
  ]

  return (
    <div className="public-page">

      <section className="public-page-header">

        <p>EXPLORE OUR COLLECTION</p>

        <h1>Book Categories</h1>

        <p>
          Explore books from different subjects and categories.
        </p>

      </section>


      <section className="categories-grid">

        {categories.map((category) => (

          <div
            className="category-card"
            key={category.name}
          >

            <div className="category-icon">
              📚
            </div>

            <h2>
              {category.name}
            </h2>

            <p>
              {category.description}
            </p>

            <Link to="/books">
              Explore Books →
            </Link>

          </div>

        ))}

      </section>

    </div>
  )
}

export default Categories