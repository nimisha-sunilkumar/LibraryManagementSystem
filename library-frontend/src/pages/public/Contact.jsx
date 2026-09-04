import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL

function Contact() {

  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const isMemberLoggedIn =
    token && role === 'User'


  const [message, setMessage] = useState({
    subject: '',
    content: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')


  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')


    if (!isMemberLoggedIn) {
      navigate('/login', {
        state: {
          from: '/contact'
        }
      })

      return
    }


    try {

      setLoading(true)


      const response = await fetch(
  `${API_URL}/api/Messages`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },

          body: JSON.stringify({
            subject: message.subject,
            content: message.content
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
            : data.message || 'Failed to send message.'
        )

      }


      setSuccess(
        data.message || 'Your message has been sent successfully.'
      )


      setMessage({
        subject: '',
        content: ''
      })


    } catch (error) {

      console.error(error)

      setError(error.message)

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="public-page contact-page">


      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="public-page-header contact-header">

        <p>
          GET IN TOUCH
        </p>

        <h1>
          Contact Us
        </h1>

        <span>
          Have a question? We would be happy to hear from you.
        </span>

      </section>


      {/* ======================================================
          CONTACT INFORMATION
      ======================================================= */}

      <section className="contact-content">


        <div className="contact-card">

          <div className="contact-icon">
            📍
          </div>

          <div>

            <h2>
              Library Address
            </h2>

            <p>
              Library Management System
              <br />
              Kakkanad, Ernakulam
              <br />
              Kerala, India
            </p>

          </div>

        </div>


        <div className="contact-card">

          <div className="contact-icon">
            📞
          </div>

          <div>

            <h2>
              Phone
            </h2>

            <p>
              +91 98765 43210
            </p>

          </div>

        </div>


        <div className="contact-card">

          <div className="contact-icon">
            ✉️
          </div>

          <div>

            <h2>
              Email
            </h2>

            <p>
              library@example.com
            </p>

          </div>

        </div>


        <div className="contact-card">

          <div className="contact-icon">
            🕐
          </div>

          <div>

            <h2>
              Library Hours
            </h2>

            <p>
              Monday – Saturday
              <br />
              9:00 AM – 6:00 PM
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          MEMBER MESSAGE SECTION
      ======================================================= */}

      <section className="contact-message-section">


        <div className="contact-message-intro">

          <p className="contact-label">
            HAVE A QUESTION?
          </p>

          <h2>
            Send us a message
          </h2>

          <p>
            Members can contact the library administration
            with questions, suggestions or other concerns.
          </p>

          <div className="contact-message-note">
            💬 Messages are securely connected to your
            library member account.
          </div>

        </div>


        {/* ==================================================
            NOT LOGGED IN
        ================================================== */}

        {!isMemberLoggedIn && (

          <div className="contact-login-box">

            <div className="contact-login-icon">
              🔐
            </div>

            <h3>
              Member Login Required
            </h3>

            <p>
              Please log in with your library member account
              to send a message to the administration team.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate('/login', {
                  state: {
                    from: '/contact'
                  }
                })
              }
            >
              Login to Send Message →
            </button>

          </div>

        )}


        {/* ==================================================
            MEMBER LOGGED IN
        ================================================== */}

        {isMemberLoggedIn && (

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            {success && (

              <div className="contact-success">
                {success}
              </div>

            )}


            {error && (

              <div className="contact-error">
                {error}
              </div>

            )}


            {/* SUBJECT */}

            <div className="form-group">

              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                type="text"
                placeholder="What would you like to ask?"
                value={message.subject}
                onChange={event =>
                  setMessage({
                    ...message,
                    subject: event.target.value
                  })
                }
                required
              />

            </div>


            {/* MESSAGE */}

            <div className="form-group">

              <label htmlFor="content">
                Message
              </label>

              <textarea
                id="content"
                rows="6"
                placeholder="Write your message here..."
                value={message.content}
                onChange={event =>
                  setMessage({
                    ...message,
                    content: event.target.value
                  })
                }
                required
              />

            </div>


            <button
              type="submit"
              className="primary-button contact-submit-button"
              disabled={loading}
            >

              {loading
                ? 'Sending...'
                : 'Send Message →'}

            </button>

          </form>

        )}

      </section>


      {/* ======================================================
          BOTTOM CTA
      ======================================================= */}

      <section className="contact-message">

        <h2>
          Ready to explore our collection?
        </h2>

        <p>
          Browse our books and discover your next great read.
        </p>

        <Link to="/books">
          Explore Books →
        </Link>

      </section>

    </div>

  )
}

export default Contact