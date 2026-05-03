import Navbar from "./Navbar";

export default function PageShell({ title, subtitle, children, rightSlot }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className="container page">
        <section className="page-head">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {rightSlot}
        </section>
        {children}
      </main>
    </div>
  );
}
