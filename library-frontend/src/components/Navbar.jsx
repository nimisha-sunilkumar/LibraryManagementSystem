import { useNavigate } from 'react-router-dom'

function Navbar() {

  const navigate = useNavigate()

  const role = localStorage.getItem('role')
  const email = localStorage.getItem('email')

  // ----------------------------------------------------------
  // Create a friendly display name from the email
  // ----------------------------------------------------------

  const getDisplayName = () => {

    if (!email) {
      return 'Guest'
    }

    const username = email.split('@')[0]

    return username
      .split('.')
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')

  }

  const displayName =
    role === 'Admin'
      ? 'Admin'
      : getDisplayName()


  // ----------------------------------------------------------
  // Get first letter for avatar
  // ----------------------------------------------------------

  const getInitial = () => {

    if (displayName === 'Guest') {
      return 'G'
    }

    return displayName.charAt(0).toUpperCase()
  }


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('memberId')

    navigate('/login')

  }


  return (

    <nav className="navbar">

      {/* ======================================================
          BRAND
      ====================================================== */}

      <div className="navbar-brand">

        <div className="navbar-logo">
          📚
        </div>

        <div>

          <h2>
            Library Management System
          </h2>

          <span>
            Manage • Discover • Read
          </span>

        </div>

      </div>


      {/* ======================================================
          USER
      ====================================================== */}

      <div className="navbar-user">

        <div className="user-info">

          <div className="user-avatar">
            {getInitial()}
          </div>

          <div className="user-details">

            <strong>
              {displayName}
            </strong>

            <span>
              {role === 'Admin' ? 'Administrator' : 'Library Member'}
            </span>

          </div>

        </div>


        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >

          <span>
            ↪
          </span>

          Logout

        </button>

      </div>

    </nav>

  )
}

export default Navbar