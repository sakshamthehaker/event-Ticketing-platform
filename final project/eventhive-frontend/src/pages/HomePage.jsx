import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="home-page">
      {/* Floating 3D ticket decorations */}
      <div className="hero-decoration">
        <div className="floating-ticket">
          <div className="ticket-line" />
        </div>
        <div className="floating-ticket">
          <div className="ticket-line" />
        </div>
        <div className="floating-ticket">
          <div className="ticket-line" />
        </div>
      </div>

      {/* Top bar */}
      <div className="container home-topbar">
        <Link to="/login" className="btn ghost">
          Sign In
        </Link>
      </div>

      {/* Hero section */}
      <section className="home-hero">
        <div className="hero-badge">
          <span className="dot" />
          <span>Campus Events Live Now</span>
        </div>

        <h1>
          Your Next Great
          <br />
          <span className="gradient-text">Experience Awaits</span>
        </h1>

        <p className="hero-subtitle">
          Discover, book, and experience the best college events — from tech fests
          to cultural nights, all in one place with instant ticket booking.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-pulse">
            🎟️ Get Started Free
          </Link>
          <Link to="/login" className="btn ghost">
            Already have an account?
          </Link>
        </div>
      </section>

      {/* Features section */}
      <section className="features-section container">
        <div className="features-grid">
          <article className="card feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Discover Events</h3>
            <p>
              Browse through a curated list of campus events — tech talks,
              cultural fests, workshops, and more.
            </p>
          </article>

          <article className="card feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant Booking</h3>
            <p>
              Book your seats in seconds with our streamlined booking system.
              No queues, no hassle.
            </p>
          </article>

          <article className="card feature-card">
            <span className="feature-icon">📊</span>
            <h3>Manage & Track</h3>
            <p>
              Keep track of all your bookings, manage cancellations, and stay
              updated on event changes.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
