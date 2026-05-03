export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  return <span className={`badge ${normalized}`}>{status}</span>;
}
