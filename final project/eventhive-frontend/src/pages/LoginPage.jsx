import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p className="muted" style={{ textAlign: "center", marginTop: "-8px" }}>
          Sign in to your EventHive account
        </p>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Enter your password"
            required
          />
        </label>
        <button className="btn btn-pulse" disabled={submitting} style={{ marginTop: "6px" }}>
          {submitting ? "Signing in..." : "🔐 Sign In"}
        </button>
        <p className="muted">
          No account? <Link to="/register">Create one free</Link>
        </p>
      </form>
    </main>
  );
}
