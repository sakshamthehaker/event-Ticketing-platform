import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="auth-layout">
      <article className="card auth-card not-found-card">
        <div className="error-code">404</div>
        <p>Oops! This page seems to have vanished into thin air.</p>
        <Link className="btn" to="/dashboard">
          🏠 Back to Dashboard
        </Link>
      </article>
    </main>
  );
}
