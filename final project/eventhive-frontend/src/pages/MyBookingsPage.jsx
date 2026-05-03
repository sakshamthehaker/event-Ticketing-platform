import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import {
  cancelBookingRequest,
  listMyBookingsRequest,
} from "../services/bookingService";
import { formatDate } from "../utils/format";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await listMyBookingsRequest({ page: 1, limit: 20 });
      setBookings(response.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (bookingId) => {
    await cancelBookingRequest(bookingId);
    toast.success("Booking cancelled");
    load();
  };

  return (
    <PageShell title="My Bookings" subtitle="🎫 Track booking and payment status">
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p className="muted">Loading bookings...</p>
        </div>
      ) : bookings.length ? (
        <section className="grid cards-grid">
          {bookings.map((booking) => (
            <article key={booking._id} className="card booking-card">
              <h3>{booking.event?.title || "Removed Event"}</h3>
              <p
                className="muted"
                style={{ fontSize: "0.85rem" }}
              >
                📅 Booked on {formatDate(booking.createdAt)}
              </p>

              <hr className="booking-divider" />

              <div
                className="info-grid"
                style={{ gridTemplateColumns: "1fr 1fr", margin: "8px 0 12px" }}
              >
                <span>🎫 {booking.seatsBooked} seat(s)</span>
                <span>
                  Booking: <StatusBadge status={booking.bookingStatus} />
                </span>
                <span>
                  Payment: <StatusBadge status={booking.paymentStatus} />
                </span>
              </div>

              {booking.bookingStatus === "confirmed" && (
                <button
                  className="btn danger"
                  onClick={() => handleCancel(booking._id)}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  ✕ Cancel Booking
                </button>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div
          className="card"
          style={{ textAlign: "center", padding: "60px 24px" }}
        >
          <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎫</p>
          <p className="muted" style={{ fontSize: "1.05rem" }}>
            No bookings yet.
          </p>
          <p className="muted" style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            Head to the dashboard to discover and book events!
          </p>
        </div>
      )}
    </PageShell>
  );
}
