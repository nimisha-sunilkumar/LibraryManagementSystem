import { Link } from 'react-router-dom'

function MemberDashboard() {

  const email = localStorage.getItem('email')

  return (

    <div>

      <h1>My Dashboard</h1>

      <p>
        Welcome to your library account.
      </p>

      {email && (
        <p>
          Logged in as: <strong>{email}</strong>
        </p>
      )}


      <div className="dashboard-cards">

        <div className="dashboard-card">

          <h2>Browse Books</h2>

          <p>
            Search and explore books available in the library.
          </p>

          <Link to="/member/books">
            View Books
          </Link>

        </div>


        <div className="dashboard-card">

          <h2>My Borrowed Books</h2>

          <p>
            View the books you have borrowed and their due dates.
          </p>

          <Link to="/member/borrowed">
            View My Books
          </Link>

        </div>


        <div className="dashboard-card">

          <h2>My Profile</h2>

          <p>
            View your library member information.
          </p>

          <Link to="/member/profile">
            View Profile
          </Link>

        </div>

      </div>

    </div>

  )
}

export default MemberDashboard