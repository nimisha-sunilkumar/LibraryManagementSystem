import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Login() {

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')


    try {

      setLoading(true)


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


     const responseText = await response.text()

let data

try {
  data = JSON.parse(responseText)
} catch {
  data = responseText
}
console.log('LOGIN RESPONSE:', data) 

if (!response.ok) {
  throw new Error(
    typeof data === 'string'
      ? data
      : data.message || 'Login failed.'
  )
}


      // ============================================================
      // SAVE LOGIN INFORMATION
      // ============================================================

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

      if (data.memberId) {

        localStorage.setItem(
          'memberId',
          data.memberId
        )

      }


      // ============================================================
      // REDIRECT BASED ON ROLE
      // ============================================================

      if (data.role === 'Admin') {

  navigate('/admin/dashboard')

} else {

  const returnPath =
    location.state?.from || '/member/dashboard'

  navigate(returnPath)

}


    } catch (error) {

      console.error(error)

      setError(error.message)

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="auth-page">

      <div className="auth-card">

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


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>

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


        <div className="auth-footer">

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account
          </Link>

        </div>


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