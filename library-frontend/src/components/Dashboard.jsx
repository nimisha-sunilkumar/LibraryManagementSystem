import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function Dashboard() {

  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const token = localStorage.getItem('token')

        if (!token) {

          throw new Error(
            'Admin authentication token not found.'
          )

        }


        const response = await fetch(
          `${API_URL}/api/Dashboard`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )


        const responseText =
          await response.text()


        let data

        try {

          data = JSON.parse(responseText)

        } catch {

          data = responseText

        }


        if (!response.ok) {

          throw new Error(

            typeof data === 'string'
              ? data
              : data.message ||
                'Failed to load dashboard.'

          )

        }


        setDashboard(data)

      } catch (error) {

        console.error(
          'Error fetching dashboard:',
          error
        )

        setError(
          error.message ||
          'Unable to load dashboard.'
        )

      } finally {

        setLoading(false)

      }

    }


    fetchDashboard()

  }, [])


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="dashboard-page">

        <h1>
          Dashboard
        </h1>

        <p>
          Loading dashboard...
        </p>

      </div>

    )

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="dashboard-page">

        <h1>
          Dashboard
        </h1>

        <div className="auth-error">
          {error}
        </div>

      </div>

    )

  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <div className="dashboard-page">

      <h1>
        Dashboard
      </h1>


      <div className="cards">


        {/* TOTAL BOOK TITLES */}

        <div className="card">

          <h3>
            Total Book Titles
          </h3>

          <p>
            {dashboard?.totalBooks ?? 0}
          </p>

        </div>


        {/* TOTAL PHYSICAL COPIES */}

        <div className="card">

          <h3>
            Total Copies
          </h3>

          <p>
            {dashboard?.totalCopies ?? 0}
          </p>

        </div>


        {/* AVAILABLE COPIES */}

        <div className="card">

          <h3>
            Books Available
          </h3>

          <p>
            {dashboard?.booksAvailable ?? 0}
          </p>

        </div>


        {/* BORROWED COPIES */}

        <div className="card">

          <h3>
            Books Borrowed
          </h3>

          <p>
            {dashboard?.booksBorrowed ?? 0}
          </p>

        </div>


        {/* AUTHORS */}

        <div className="card">

          <h3>
            Total Authors
          </h3>

          <p>
            {dashboard?.totalAuthors ?? 0}
          </p>

        </div>


        {/* CATEGORIES */}

        <div className="card">

          <h3>
            Total Categories
          </h3>

          <p>
            {dashboard?.totalCategories ?? 0}
          </p>

        </div>


        {/* MEMBERS */}

        <div className="card">

          <h3>
            Total Members
          </h3>

          <p>
            {dashboard?.totalMembers ?? 0}
          </p>

        </div>


      </div>

    </div>

  )

}

export default Dashboard