export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={fullPage ? "spinner-wrap full-page" : "spinner-wrap"}>
      <div className="spinner" />
    </div>
  );
}
