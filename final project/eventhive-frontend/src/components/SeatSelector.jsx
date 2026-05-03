import { useMemo, useState } from "react";

export default function SeatSelector({ max, value, onChange }) {
  const totalSeats = Math.max(1, max + (value || 0)); // Approximate total for visual grid
  const displayCount = Math.min(totalSeats, 60); // Cap visual seats at 60

  // Generate seat states
  const seats = useMemo(() => {
    const arr = [];
    const bookedCount = Math.max(0, displayCount - max);
    for (let i = 0; i < displayCount; i++) {
      if (i < bookedCount) {
        arr.push("booked");
      } else {
        arr.push("available");
      }
    }
    return arr;
  }, [displayCount, max]);

  const [selectedSeats, setSelectedSeats] = useState(new Set());

  const handleSeatClick = (index) => {
    if (seats[index] === "booked") return;

    const newSelected = new Set(selectedSeats);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      if (newSelected.size >= max) return;
      newSelected.add(index);
    }
    setSelectedSeats(newSelected);
    onChange(newSelected.size || 1);
  };

  return (
    <div className="seat-selector-wrap">
      {/* Screen indicator */}
      <div className="screen-indicator">
        <div className="screen-bar" />
        <span>Stage / Screen</span>
      </div>

      {/* Seat grid */}
      <div className="seats-grid">
        {seats.map((status, i) => (
          <div
            key={i}
            className={`seat ${
              status === "booked"
                ? "booked"
                : selectedSeats.has(i)
                ? "selected"
                : ""
            }`}
            onClick={() => handleSeatClick(i)}
            title={
              status === "booked"
                ? "Booked"
                : selectedSeats.has(i)
                ? "Selected"
                : "Available"
            }
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="seat-legend-item">
          <div className="seat-demo available-demo" />
          <span>Available</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-demo selected-demo" />
          <span>Selected ({selectedSeats.size})</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-demo booked-demo" />
          <span>Booked</span>
        </div>
      </div>

      <small className="muted" style={{ display: "block", textAlign: "center", marginTop: "12px" }}>
        {max} seats available — click to select
      </small>
    </div>
  );
}
