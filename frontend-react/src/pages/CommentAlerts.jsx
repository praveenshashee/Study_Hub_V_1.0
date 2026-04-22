import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function formatAlertDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function CommentAlerts({ currentUser, authLoading }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.role === "admin";

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/comment-alerts");
      setAlerts(response.data.alerts || []);
    } catch (err) {
      console.error("Failed to load comment alerts:", err);
      setError(err.response?.data?.message || "Failed to load comment alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadAlerts();
  }, [authLoading, isAdmin, loadAlerts]);

  if (authLoading || loading) {
    return (
      <main className="comment-alerts-shell">
        <section className="dashboard-loading-card">
          <div className="profile-loading-orbit"></div>
          <p>Loading comment alerts...</p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="comment-alerts-shell">
        <section className="dashboard-empty-card">
          <span>SH</span>
          <h1>Admin access required</h1>
          <p>Comment alerts are available for admins only.</p>
          <Link to="/dashboard" className="dashboard-primary-link">
            Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="comment-alerts-shell">
      <Link to="/dashboard" className="comment-alerts-back-link">
        Back to Dashboard
      </Link>

      <section className="comment-alerts-hero">
        <div>
          <span className="dashboard-eyebrow">Comment Alerts</span>
          <h1>Learner comments</h1>
          <p>Review up to 10 recent comments that still need an admin reply.</p>
        </div>

        <div className="comment-alerts-count-card">
          <span>Status</span>
          <strong>{alerts.length > 0 ? "Open" : "Clear"}</strong>
        </div>
      </section>

      {error && <p className="error-text dashboard-feedback">{error}</p>}

      {!error && alerts.length === 0 && (
        <section className="comment-alerts-empty">
          <h2>No learner comments yet</h2>
          <p>New video comments will appear here for admin review.</p>
        </section>
      )}

      {!error && alerts.length > 0 && (
        <section className="comment-alert-card-grid">
          {alerts.map((alert) => (
            <article
              className="comment-alert-card unreplied"
              key={alert.id}
            >
              <div className="comment-alert-topline">
                <span>{alert.videoSubject || "Video"}</span>
                <strong>Needs reply</strong>
              </div>

              <h2>{alert.videoTitle}</h2>

              <div className="comment-alert-author">
                <span>
                  {alert.author?.fullName?.slice(0, 2).toUpperCase() || "US"}
                </span>
                <div>
                  <strong>{alert.author?.fullName || "Study Hub User"}</strong>
                  <p>{formatAlertDate(alert.createdAt)}</p>
                </div>
              </div>

              <p className="comment-alert-body">{alert.body}</p>

              <div className="comment-alert-footer">
                <span>Awaiting admin reply</span>
                <Link to={`/video/${alert.videoId}`}>Open Video</Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default CommentAlerts;
