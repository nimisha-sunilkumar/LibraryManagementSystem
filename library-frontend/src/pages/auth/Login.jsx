import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'


function Login() {

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setLoading(true)


    try {

      // ========================================================
      // LOGIN API
      // ========================================================

      const response = await fetch(
        'http://localhost:5000/api/Auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      )


      // ========================================================
      // READ RESPONSE
      // ========================================================

      const responseText = await response.text()

      let data

      try {

        data = JSON.parse(responseText)

      } catch {

        data = responseText

      }

      console.log(
        'LOGIN RESPONSE:',
        data
      )


      // ========================================================
      // LOGIN FAILED
      // ========================================================

      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message || 'Login failed.'
        )

      }


      // ========================================================
      // CHECK TOKEN
      // ========================================================

      if (!data.token) {

        throw new Error(
          'Login succeeded, but no authentication token was received.'
        )

      }


      // ========================================================
      // CLEAR OLD LOGIN INFORMATION
      // ========================================================

      // IMPORTANT:
      // We also remove the old "user" object.
      // This prevents an old member/admin user from
      // affecting the new login after refresh.

      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      localStorage.removeItem('memberId')
      localStorage.removeItem('user')


      // ========================================================
      // SAVE LOGIN INFORMATION
      // ========================================================

      localStorage.setItem(
        'token',
        data.token
      )


      localStorage.setItem(
        'userId',
        data.userId
      )


      localStorage.setItem(
        'email',
        data.email
      )


      localStorage.setItem(
        'role',
        data.role
      )


      // ========================================================
      // SAVE MEMBER ID
      // ========================================================

      if (
        data.role === 'User' &&
        data.memberId
      ) {

        localStorage.setItem(
          'memberId',
          data.memberId
        )

      }


      // ========================================================
      // SAVE COMPLETE USER OBJECT
      // ========================================================

      // This is important for Navbar / Sidebar
      // and for restoring login information after refresh.

      const loggedInUser = {

        userId: data.userId,

        email: data.email,

        role: data.role,

        memberId: data.memberId || null,

        fullName: data.fullName || ''

      }


      localStorage.setItem(
        'user',
        JSON.stringify(loggedInUser)
      )


      // ========================================================
      // DEBUG INFORMATION
      // ========================================================

      console.log(
        'LOGIN USER:',
        loggedInUser
      )

      console.log(
        'TOKEN:',
        localStorage.getItem('token')
      )

      console.log(
        'USER ID:',
        localStorage.getItem('userId')
      )

      console.log(
        'EMAIL:',
        localStorage.getItem('email')
      )

      console.log(
        'ROLE:',
        localStorage.getItem('role')
      )

      console.log(
        'MEMBER ID:',
        localStorage.getItem('memberId')
      )

      console.log(
        'USER OBJECT:',
        localStorage.getItem('user')
      )


      // ========================================================
      // REDIRECT BASED ON ROLE
      // ========================================================

      if (
        data.role?.toLowerCase() === 'admin'
      ) {

        navigate(
          '/admin/dashboard',
          {
            replace: true
          }
        )

      }

      else if (
        data.role?.toLowerCase() === 'user'
      ) {

        const returnPath =
          location.state?.from ||
          '/member/dashboard'

        navigate(
          returnPath,
          {
            replace: true
          }
        )

      }

      else {

        throw new Error(
          'Unknown user role received from server.'
        )

      }

    }


    catch (error) {

      console.error(
        'Login error:',
        error
      )

      setError(
        error.message ||
        'Unable to login.'
      )

    }


    finally {

      setLoading(false)

    }

  }


  // ============================================================
  // LOGIN UI
  // ============================================================

  return (

    <div className="auth-page">

      <div className="auth-card">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="auth-header">

          <p>
            LIBRARY MANAGEMENT SYSTEM
          </p>

          <h1>
            Welcome Back
          </h1>

          <span>
            Login to access your library account.
          </span>

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="auth-error">
            {error}
          </div>

        )}


        {/* ======================================================
            LOGIN FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>

          {/* ====================================================
              EMAIL
          ==================================================== */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>


          {/* ====================================================
              PASSWORD
          ==================================================== */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>


          {/* ====================================================
              LOGIN BUTTON
          ==================================================== */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

        </form>


        {/* ======================================================
            REGISTER
        ====================================================== */}

        <div className="auth-footer">

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account
          </Link>

        </div>


        {/* ======================================================
            BACK HOME
        ====================================================== */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>

    </div>

  )

}

export default Login