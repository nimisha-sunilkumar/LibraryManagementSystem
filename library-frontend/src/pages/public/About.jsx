function About() {
  return (
    <div className="public-page about-page">

      {/* HERO */}
      <section className="public-page-header about-header">

        <p>ABOUT OUR LIBRARY</p>

        <h1>About Us</h1>

        <span>
          A place for readers, learners and explorers.
        </span>

      </section>


      {/* INTRO */}
      <section className="about-intro">

        <div className="about-intro-icon">
          📚
        </div>

        <div>

          <p className="about-label">
            OUR LIBRARY
          </p>

          <h2>
            Bringing books and readers together.
          </h2>

          <p>
            Our Library Management System provides a simple
            and convenient way to explore and manage a collection
            of books.
          </p>

          <p>
            Readers can browse books, discover different authors
            and categories, and view detailed information about
            the books available in our collection.
          </p>

        </div>

      </section>


      {/* FEATURES */}
      <section className="about-features">

        <div className="about-feature-card">

          <div className="about-feature-icon">
            🔎
          </div>

          <h3>
            Discover
          </h3>

          <p>
            Explore books across different categories and
            discover something new to read.
          </p>

        </div>


        <div className="about-feature-card">

          <div className="about-feature-icon">
            📖
          </div>

          <h3>
            Learn
          </h3>

          <p>
            Find books covering different subjects, interests
            and areas of knowledge.
          </p>

        </div>


        <div className="about-feature-card">

          <div className="about-feature-icon">
            🤝
          </div>

          <h3>
            Connect
          </h3>

          <p>
            Enjoy a welcoming digital library experience built
            around readers and their interests.
          </p>

        </div>

      </section>


      {/* WHAT WE OFFER + GOAL */}
      <section className="about-details">

        <div className="about-detail-card">

          <span className="about-detail-number">
            01
          </span>

          <h2>
            What We Offer
          </h2>

          <p>
            Our library provides books across different subjects,
            categories and interests. Our goal is to make finding
            and discovering books easier for everyone.
          </p>

        </div>


        <div className="about-detail-card">

          <span className="about-detail-number">
            02
          </span>

          <h2>
            Our Goal
          </h2>

          <p>
            We aim to create a welcoming digital library experience
            where readers can discover new books and easily access
            information about our collection.
          </p>

        </div>

      </section>


      {/* QUOTE */}
      <section className="about-quote">

        <div className="about-quote-icon">
          ❝
        </div>

        <h2>
          Every book opens a door to a new world.
        </h2>

        <p>
          Explore. Learn. Read. Discover.
        </p>

      </section>

    </div>
  )
}

export default About