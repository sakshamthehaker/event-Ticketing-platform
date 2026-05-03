import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import {
  deleteEventRequest,
  listEventsRequest,
  listMyEventsRequest,
} from "../services/eventService";
import { listAllBookingsRequest } from "../services/bookingService";
import useAuth from "../hooks/useAuth";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDashboardData = async (searchTerm = "") => {
    setLoading(true);
    try {
      let eventsResponse;

      if (user?.role === "admin") {
        eventsResponse = await listMyEventsRequest({
          search: searchTerm,
          page: 1,
          limit: 12,
        });
      } else {
        eventsResponse = await listEventsRequest({
          search: searchTerm,
          page: 1,
          limit: 12,
        });
      }

      setEvents(eventsResponse.data.data.items || []);

      if (user?.role === "admin") {
        const bookingsResponse = await listAllBookingsRequest({
          page: 1,
          limit: 15,
        });
        setAdminBookings(bookingsResponse.data.data.items || []);
      } else {
        setAdminBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadDashboardData(search);
  };

  const handleDeleteEvent = async (eventItem) => {
    const ok = window.confirm(
      `Delete "${eventItem.title}"? This action cannot be undone.`
    );
    if (!ok) return;

    await deleteEventRequest(eventItem._id);
    toast.success("Event deleted");
    loadDashboardData(search);
  };

  return (
    <PageShell
      title={user?.role === "admin" ? "Admin Dashboard" : "Explore Events"}
      subtitle={
        user?.role === "admin"
          ? "Manage your events and view bookings"
          : "Discover and book amazing campus events"
      }
      rightSlot={
        <div className="search-actions">
          <form onSubmit={handleSearch} className="search-box">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="🔍 Search events..."
            />
            <button className="btn">Search</button>
          </form>
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : events.length ? (
        <section className="grid cards-grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              canDelete={user?.role === "admin"}
              onDelete={handleDeleteEvent}
            />
          ))}
        </section>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎭</p>
          <p className="muted" style={{ fontSize: "1.05rem" }}>
            No events available right now.
          </p>
          <p className="muted" style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            {user?.role === "admin"
              ? "Create your first event to get started!"
              : "Check back soon for upcoming events."}
          </p>
        </div>
      )}

      {user?.role === "admin" && adminBookings.length > 0 && (
        <section className="card admin-table-wrap">
          <h2>📋 Recent User Bookings</h2>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Seats</th>
                  <th>Booking</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {adminBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.user?.name || "N/A"}</td>
                    <td>{booking.user?.email || "N/A"}</td>
                    <td>{booking.event?.title || "N/A"}</td>
                    <td>{booking.seatsBooked}</td>
                    <td>
                      <StatusBadge status={booking.bookingStatus} />
                    </td>
                    <td>
                      <StatusBadge status={booking.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageShell>
  );
}
