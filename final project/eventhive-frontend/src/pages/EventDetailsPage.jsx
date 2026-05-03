import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import { getEventRequest } from "../services/eventService";
import { getEventRecommendationsRequest } from "../services/mlService";
import { formatCurrency, formatDate } from "../utils/format";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getEventRequest(eventId);
        setEvent(response.data.data);

        // Load recommendations (non-blocking)
        try {
          const recRes = await getEventRecommendationsRequest(eventId, 4);
          setRecommendations(recRes.data.data?.items || []);
        } catch {
          // Recommendations are optional, don't break the page
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!event)
    return (
      <PageShell title="Event Details">
        <p className="card">Event not found.</p>
      </PageShell>
    );

  const soldOut = event.availableSeats <= 0;
  const seatsPercent = event.totalSeats
    ? Math.round(
        ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100
      )
    : 0;

  return (
    <PageShell title={event.title} subtitle={`📍 ${event.location}`}>
      <article className="card detail-card">
        <p>{event.description}</p>

        <div className="info-grid">
          <span>
            <span className="info-icon">📅</span> {formatDate(event.date)}
          </span>
          <span>
            <span className="info-icon">💰</span> {formatCurrency(event.price)}
          </span>
          <span>
            <span className="info-icon">🎫</span> {event.availableSeats} seats
            available
          </span>
          <span>
            <span className="info-icon">🏟️</span> {event.totalSeats} total
            capacity
          </span>
        </div>

        {/* Booking progress */}
        <div style={{ margin: "16px 0 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "0.85rem",
            }}
          >
            <span className="muted">Booking Progress</span>
            <span style={{ color: "var(--primary-light)", fontWeight: "700" }}>
              {seatsPercent}% filled
            </span>
          </div>
          <div className="seats-progress" style={{ height: "6px" }}>
            <div
              className="seats-progress-fill"
              style={{ width: `${seatsPercent}%` }}
            />
          </div>
        </div>

        {soldOut ? (
          <div
            className="pill danger"
            style={{ padding: "12px 20px", fontSize: "0.9rem" }}
          >
            ❌ Sold Out — No seats available
          </div>
        ) : (
          <Link className="btn btn-pulse" to={`/events/${event._id}/book`}>
            🎟️ Book Tickets Now
          </Link>
        )}
      </article>

      {/* ═══ ML Recommended Events ═══ */}
      {recommendations.length > 0 && (
        <section style={{ marginTop: "32px" }}>
          <h2 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>
            🧠 Similar Events{" "}
            <span
              className="muted"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              — K-Means Recommendation
            </span>
          </h2>
          <div className="grid cards-grid">
            {recommendations.map((rec) => (
              <Link
                key={rec._id}
                to={`/events/${rec._id}`}
                className="card recommendation-card"
              >
                <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>
                  {rec.title}
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    fontSize: "0.85rem",
                  }}
                >
                  <span className="muted">
                    📍 {rec.location}
                  </span>
                  <span className="muted">
                    💰 {formatCurrency(rec.price)}
                  </span>
                  {rec.recommendationScore != null && (
                    <span
                      style={{
                        color: "var(--primary-light)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      Score: {(rec.recommendationScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
