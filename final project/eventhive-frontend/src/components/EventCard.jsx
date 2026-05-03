import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/format";
import { useRef } from "react";

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #e23744 0%, #ff6b6b 50%, #c41e2a 100%)",
  "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #4f46e5 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)",
  "linear-gradient(135deg, #10b981 0%, #34d399 50%, #059669 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #db2777 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #2563eb 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #7c3aed 100%)",
  "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #ea580c 100%)",
];

const COVER_ICONS = ["🎭", "🎸", "🎨", "🏆", "🎤", "💻", "🎪", "📚"];

export default function EventCard({ event, canDelete = false, onDelete }) {
  const soldOut = event.availableSeats <= 0;
  const cardRef = useRef(null);

  // Hash event title for consistent gradient/icon
  const hash = Array.from(event.title || "").reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0
  );
  const gradientIndex = hash % COVER_GRADIENTS.length;
  const iconIndex = hash % COVER_ICONS.length;

  const seatsPercent = event.totalSeats
    ? Math.round(
        ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100
      )
    : 0;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = ((centerY - y) / centerY) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
  };

  return (
    <article
      className="card event-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cover gradient with icon */}
      <div className="card-cover">
        <div
          className="card-cover-gradient"
          style={{ background: COVER_GRADIENTS[gradientIndex] }}
        >
          <span className="cover-icon">{COVER_ICONS[iconIndex]}</span>
        </div>
      </div>

      <div className="event-head">
        <h3>{event.title}</h3>
        <span className={soldOut ? "pill danger" : "pill"}>
          {soldOut ? "Sold out" : `${event.availableSeats} seats`}
        </span>
      </div>

      <p className="muted" style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
        {event.description.slice(0, 100)}...
      </p>

      <div className="info-grid" style={{ gridTemplateColumns: "1fr 1fr", margin: "4px 0 8px" }}>
        <span>📅 {formatDate(event.date)}</span>
        <span>📍 {event.location}</span>
        <span>💰 {formatCurrency(event.price)}</span>
        <span>
          🎫 {event.totalSeats - event.availableSeats}/{event.totalSeats} booked
        </span>
      </div>

      {/* Seats progress bar */}
      <div className="seats-progress">
        <div
          className="seats-progress-fill"
          style={{ width: `${seatsPercent}%` }}
        />
      </div>

      <div className="actions">
        <Link className="btn" to={`/events/${event._id}`}>
          View Details
        </Link>
        {canDelete && (
          <button className="btn danger" onClick={() => onDelete?.(event)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
