import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {

  const navigate = useNavigate()

  // API URL comes from .env
  // Local: http://localhost:5000
  // Render: https://library-api-ywje.onrender.com
  const API_URL = import.meta.env.VITE_API_URL

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


  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {

    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })

  }


  // ============================================================
  // REGISTER
  // ============================================================

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


      // ==========================================================
      // REGISTER API
      // ==========================================================

      const response = await fetch(
        `${API_URL}/api/Auth/register`,
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


      // ==========================================================
      // READ RESPONSE
      // ==========================================================

      const responseText = await response.text()

      let data

      try {

        data = JSON.parse(responseText)

      } catch {

        data = responseText

      }


      console.log(
        'REGISTER RESPONSE:',
        data
      )


      // ==========================================================
      // REGISTRATION FAILED
      // ==========================================================

      if (!response.ok) {

        throw new Error(
          typeof data === 'string'
            ? data
            : data.message || 'Registration failed.'
        )

      }


      // ==========================================================
      // REGISTRATION SUCCESS
      // ==========================================================

      setSuccess(
        'Account created successfully! Redirecting to login...'
      )


      setTimeout(() => {

        navigate('/login')

      }, 1500)


    } catch (error) {

      console.error(
        'Registration error:',
        error
      )

      setError(
        error.message ||
        'Unable to register.'
      )

    } finally {

      setLoading(false)

    }

  }


  // ============================================================
  // REGISTER UI
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
            Create Account
          </h1>

          <span>
            Register as a library member.
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
            SUCCESS
        ====================================================== */}

        {success && (

          <div className="auth-success">
            {success}
          </div>

        )}


        {/* ======================================================
            REGISTER FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>

          {/* ====================================================
              FULL NAME
          ==================================================== */}

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


          {/* ====================================================
              ADMISSION NUMBER
          ==================================================== */}

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


          {/* ====================================================
              EMAIL
          ==================================================== */}

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


          {/* ====================================================
              PASSWORD
          ==================================================== */}

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


          {/* ====================================================
              CONFIRM PASSWORD
          ==================================================== */}

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


          {/* ====================================================
              REGISTER BUTTON
          ==================================================== */}

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


        {/* ======================================================
            LOGIN LINK
        ====================================================== */}

        <div className="auth-footer">

          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Login
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

export default Register