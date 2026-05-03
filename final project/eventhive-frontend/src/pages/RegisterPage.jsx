import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminPasscode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Join EventHive</h1>
        <p className="muted" style={{ textAlign: "center", marginTop: "-8px" }}>
          Create your account and start booking
        </p>
        <label className="field">
          <span>Full Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="John Doe"
            required
          />
        </label>
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
            placeholder="Create a strong password"
            required
          />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                role: event.target.value,
                adminPasscode:
                  event.target.value === "admin" ? prev.adminPasscode : "",
              }))
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {form.role === "admin" && (
          <label className="field">
            <span>Admin Passcode</span>
            <input
              type="password"
              value={form.adminPasscode}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  adminPasscode: event.target.value,
                }))
              }
              placeholder="Enter admin passcode"
              required
            />
          </label>
        )}
        <button
          className="btn btn-pulse"
          disabled={submitting}
          style={{ marginTop: "6px" }}
        >
          {submitting ? "Creating account..." : "🚀 Create Account"}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
