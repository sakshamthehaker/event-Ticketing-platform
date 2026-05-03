import PageShell from "../components/PageShell";
import useAuth from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <PageShell title="Profile" subtitle="Your account details">
      <article className="card profile-card">
        {/* Profile header with avatar */}
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <h2>{user?.name || "User"}</h2>
            <div className="role-badge">
              {user?.role === "admin" ? "👑 Admin" : "👤 User"}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-label">Full Name</span>
            <span className="stat-value">{user?.name || "—"}</span>
          </div>
          <div className="profile-stat">
            <span className="stat-label">Email Address</span>
            <span className="stat-value">{user?.email || "—"}</span>
          </div>
          <div className="profile-stat">
            <span className="stat-label">Account Role</span>
            <span className="stat-value" style={{ textTransform: "capitalize" }}>
              {user?.role || "—"}
            </span>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
