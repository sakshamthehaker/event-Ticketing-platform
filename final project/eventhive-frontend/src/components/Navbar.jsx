import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/dashboard" className="brand">
          🎪 EventHive
        </Link>

        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/my-bookings">My Bookings</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/create-event">Create Event</NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/analytics">🧠 Analytics</NavLink>
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e23744, #ff6b6b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: "800",
              fontSize: "0.78rem",
              color: "white",
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          <button className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
