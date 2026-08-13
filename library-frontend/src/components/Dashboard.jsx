import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL

function Dashboard() {
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
  fetch(`${API_URL}/api/Dashboard`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard')
      }

      return response.json()
    })
    .then(data => {
      setDashboard(data)
    })
    .catch(error => {
      console.error('Error fetching dashboard:', error)
    })
}, [])

  if (!dashboard) {
    return <p>Loading dashboard...</p>
  }

  return (
    <div className="dashboard-page">

      <h1>Dashboard</h1>

      <div className="cards">

        {/* Book Titles */}
        <div className="card">
          <h3>Total Book Titles</h3>
          <p>{dashboard.totalBooks}</p>
        </div>

        {/* Total Physical Copies */}
        <div className="card">
          <h3>Total Copies</h3>
          <p>{dashboard.totalCopies}</p>
        </div>

        {/* Available Copies */}
        <div className="card">
          <h3>Books Available</h3>
          <p>{dashboard.booksAvailable}</p>
        </div>

        {/* Borrowed Copies */}
        <div className="card">
          <h3>Books Borrowed</h3>
          <p>{dashboard.booksBorrowed}</p>
        </div>

        {/* Authors */}
        <div className="card">
          <h3>Total Authors</h3>
          <p>{dashboard.totalAuthors}</p>
        </div>

        {/* Categories */}
        <div className="card">
          <h3>Total Categories</h3>
          <p>{dashboard.totalCategories}</p>
        </div>

        {/* Members */}
        <div className="card">
          <h3>Total Members</h3>
          <p>{dashboard.totalMembers}</p>
        </div>

      </div>

    </div>
  )
}

export default Dashboard