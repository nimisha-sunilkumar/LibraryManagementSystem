import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)


  const handleChange = (event) => {

    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })

  }


  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')


    // ============================================================
    // PASSWORD VALIDATION
    // ============================================================

    if (formData.password !== formData.confirmPassword) {

      setError('Passwords do not match.')

      return
    }


    if (formData.password.length < 6) {

      setError('Password must contain at least 6 characters.')

      return
    }


    try {

      setLoading(true)


      const response = await fetch(
        'http://localhost:5000/api/Auth/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            fullName: formData.fullName,
            admissionNumber: formData.admissionNumber,
            email: formData.email,
            password: formData.password
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

if (!response.ok) {
  throw new Error(
    typeof data === 'string'
      ? data
      : data.message || 'Registration failed.'
  )
}


      setSuccess(
        'Account created successfully! Redirecting to login...'
      )


      setTimeout(() => {

        navigate('/login')

      }, 1500)


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
            Create Account
          </h1>

          <span>
            Register as a library member.
          </span>

        </div>


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="admissionNumber">
              Admission Number
            </label>

            <input
              id="admissionNumber"
              name="admissionNumber"
              type="text"
              placeholder="Example: ME2022005"
              value={formData.admissionNumber}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? 'Creating Account...'
              : 'Register'}

          </button>

        </form>


        <div className="auth-footer">

          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Login
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

export default Register