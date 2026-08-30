import { Link } from 'react-router-dom'

function Contact() {
  return (
    <div className="public-page">

      <section className="public-page-header">

        <p>GET IN TOUCH</p>

        <h1>Contact Us</h1>

        <p>
          Have a question? We would be happy to hear from you.
        </p>

      </section>


      <section className="contact-content">

        <div className="contact-card">

          <div className="contact-icon">
            📍
          </div>

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


        <div className="contact-card">

          <div className="contact-icon">
            📞
          </div>

          <h2>
            Phone
          </h2>

          <p>
            +91 98765 43210
          </p>

        </div>


        <div className="contact-card">

          <div className="contact-icon">
            ✉️
          </div>

          <h2>
            Email
          </h2>

          <p>
            library@example.com
          </p>

        </div>


        <div className="contact-card">

          <div className="contact-icon">
            🕐
          </div>

          <h2>
            Library Hours
          </h2>

          <p>
            Monday – Saturday
            <br />
            9:00 AM – 6:00 PM
          </p>

        </div>

      </section>


      <section className="contact-message">

        <h2>
          Ready to explore our collection?
        </h2>

        <p>
          Browse our books and discover your next great read.
        </p>

        <Link to="/books">
          Explore Books
        </Link>

      </section>

    </div>
  )
}

export default Contact