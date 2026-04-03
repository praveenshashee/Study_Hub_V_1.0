export default function StatusPanel({ title, description, tone = "neutral", action }) {
  return (
    <section className={`status-panel ${tone}`}>
      <p className="status-eyebrow">{tone === "error" ? "Something went wrong" : "Study Hub"}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {action || null}
    </section>
  );
}
