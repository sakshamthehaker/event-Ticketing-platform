import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageShell from "../components/PageShell";
import { createEventRequest } from "../services/eventService";

const initialState = {
  title: "",
  description: "",
  date: "",
  location: "",
  totalSeats: 10,
  price: 0,
};

export default function CreateEventPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalSeats: Number(form.totalSeats),
        price: Number(form.price),
      };
      const response = await createEventRequest(payload);
      toast.success("🎉 Event created successfully!");
      navigate(`/events/${response.data.data._id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Create Event"
      subtitle="🎪 Publish and manage campus events"
    >
      <form
        className="card form-grid create-event-form"
        onSubmit={handleSubmit}
      >
        <label className="field">
          <span>Event Title</span>
          <input
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="e.g. Annual Tech Fest 2026"
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            placeholder="Describe the event, agenda, and what attendees can expect..."
            required
          />
        </label>
        <label className="field">
          <span>📅 Date & Time</span>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, date: event.target.value }))
            }
            required
          />
        </label>
        <label className="field">
          <span>📍 Location</span>
          <input
            value={form.location}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, location: event.target.value }))
            }
            placeholder="e.g. Main Auditorium, Block A"
            required
          />
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <label className="field">
            <span>🎫 Total Seats</span>
            <input
              type="number"
              min="1"
              value={form.totalSeats}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  totalSeats: event.target.value,
                }))
              }
              required
            />
          </label>
          <label className="field">
            <span>💰 Price (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: event.target.value }))
              }
              required
            />
          </label>
        </div>
        <button
          className="btn btn-pulse"
          disabled={submitting}
          style={{ marginTop: "8px", padding: "14px" }}
        >
          {submitting ? "Publishing..." : "🚀 Publish Event"}
        </button>
      </form>
    </PageShell>
  );
}
