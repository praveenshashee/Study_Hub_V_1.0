import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const REFRESH_INTERVAL_MS = 300000;

function Dashboard({ currentUser, authLoading }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const response = await api.get("/api/dashboard");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.response?.data?.message || "Failed to load dashboard analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setLoading(false);
      return undefined;
    }

    fetchDashboard();
    const intervalId = window.setInterval(() => {
      fetchDashboard({ silent: true });
    }, dashboardData?.refreshIntervalMs || REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [authLoading, currentUser, dashboardData?.refreshIntervalMs, fetchDashboard]);

  const subjectMaxViews = useMemo(() => {
    const subjects = dashboardData?.subjectPopularity || [];
    return Math.max(...subjects.map((item) => item.totalViews), 1);
  }, [dashboardData]);

  const internshipMaxInterest = useMemo(() => {
    const categories = dashboardData?.internshipInterest || [];
    return Math.max(...categories.map((item) => item.interestCount), 1);
  }, [dashboardData]);

  if (authLoading || loading) {
    return (
      <main className="dashboard-shell">
        <section className="dashboard-loading-card">
          <div className="profile-loading-orbit"></div>
          <p>Loading live dashboard data...</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="dashboard-shell">
        <section className="dashboard-empty-card">
          <span>SH</span>
          <h1>Login to open your dashboard</h1>
          <p>
            Your dashboard uses live Study Hub data to show recommendations,
            analytics, videos, internships, and events.
          </p>
          <Link to="/login" className="dashboard-primary-link">
            Login
          </Link>
        </section>
      </main>
    );
  }

  const stats = dashboardData?.stats || {};
  const recommendations = dashboardData?.recommendations || {};
  const generatedAt = dashboardData?.generatedAt
    ? new Date(dashboardData.generatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Now";

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            {isAdmin ? "Admin Analytics" : "Your Study Hub"}
          </span>
          <h1>{isAdmin ? "Platform Dashboard" : `Welcome back, ${currentUser.fullName}`}</h1>
          <p>
            {isAdmin
              ? "Live database insights for videos, subjects, internships, events, and users."
              : "Recommended learning content and opportunities, refreshed from the live platform."}
          </p>
        </div>

        <div className="dashboard-refresh-panel">
          {isAdmin && (
            <Link
              to="/comment-alerts"
              className={`dashboard-bell-link ${stats.hasUnrepliedCommentAlerts ? "has-alert" : ""}`}
              aria-label="Open comment alerts"
            >
              <span>Comment alerts</span>
            </Link>
          )}

          <span>Last updated</span>
          <strong>{generatedAt}</strong>
          <button
            type="button"
            onClick={() => fetchDashboard({ silent: true })}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {error && <p className="error-text dashboard-feedback">{error}</p>}

      {!isAdmin && (
        <section className="dashboard-priority-section">
          <div className="dashboard-section-header">
            <span>Recommended</span>
            <h2>Start here</h2>
          </div>

          <div className="dashboard-recommendation-grid">
            {recommendations.videos?.slice(0, 2).map((video) => (
              <Link
                to={`/video/${video.id}`}
                className="dashboard-feature-card"
                key={`video-${video.id}`}
              >
                <img src={video.thumbnailUrl} alt={video.title} />
                <div>
                  <span>{video.subject}</span>
                  <h3>{video.title}</h3>
                  <p>{video.views} views · {video.rating} rating</p>
                </div>
              </Link>
            ))}

            {recommendations.internships?.slice(0, 1).map((internship) => (
              <Link
                to={`/internships/details/${internship.id}`}
                className="dashboard-feature-card dashboard-feature-card-text"
                key={`internship-${internship.id}`}
              >
                <span>{internship.category || "Internship"}</span>
                <h3>{internship.title}</h3>
                <p>{internship.company} · {internship.location || "Remote/On-site"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-stat-grid">
        <DashboardStat label="Videos" value={stats.totalVideos} note={`${stats.totalViews || 0} total views`} />
        <DashboardStat label="Avg Rating" value={stats.averageRating} note="Across video library" />
        <DashboardStat label="Internships" value={stats.totalInternships} note={`${stats.activeInternships || 0} active`} />
        {isAdmin && (
          <>
            <DashboardStat label="Users" value={stats.totalUsers} note="Registered accounts" />
            <DashboardStat
              label="Pending"
              value={stats.pendingInternshipNotifications}
              note="Internship notifications"
            />
          </>
        )}
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel dashboard-wide-panel">
          <div className="dashboard-section-header">
            <span>Trending</span>
            <h2>Top viewed videos</h2>
          </div>

          <div className="dashboard-top-video-grid">
            {(dashboardData?.topVideos || []).map((video, index) => (
              <Link to={`/video/${video.id}`} className="dashboard-video-rank-card" key={video.id}>
                <strong>#{index + 1}</strong>
                <img src={video.thumbnailUrl} alt={video.title} />
                <div>
                  <span>{video.subject}</span>
                  <h3>{video.title}</h3>
                  <p>{video.views} views · {video.rating} rating</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-section-header">
            <span>Live Chart</span>
            <h2>Subject popularity</h2>
          </div>

          <div className="dashboard-bar-list">
            {(dashboardData?.subjectPopularity || []).map((item) => (
              <BarRow
                key={item.subject}
                label={item.subject}
                value={`${item.totalViews} views`}
                percent={(item.totalViews / subjectMaxViews) * 100}
              />
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-section-header">
            <span>Interest</span>
            <h2>Internship categories</h2>
          </div>

          <div className="dashboard-bar-list">
            {(dashboardData?.internshipInterest || []).map((item) => (
              <BarRow
                key={item.category}
                label={item.category}
                value={`${item.interestCount} signals`}
                percent={(item.interestCount / internshipMaxInterest) * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-list-grid">
        <DashboardList
          title="Recommended Internships"
          label="Opportunities"
          emptyText="No internships available yet."
          items={recommendations.internships || []}
          renderItem={(item) => (
            <Link to={`/internships/details/${item.id}`} className="dashboard-list-item">
              <strong>{item.title}</strong>
              <span>{item.company} · {item.category || "General"}</span>
            </Link>
          )}
        />

        {isAdmin && (
          <div className="dashboard-panel dashboard-actions-panel">
            <div className="dashboard-section-header">
              <span>Admin</span>
              <h2>Quick actions</h2>
            </div>
            <Link to="/upload">Upload video</Link>
            <Link to="/internships/add">Add internship</Link>
            <Link to="/events/add">Add event</Link>
            <Link to="/internships/notifications">Review internship notifications</Link>
          </div>
        )}
      </section>
    </main>
  );
}

function DashboardStat({ label, value, note }) {
  return (
    <div className="dashboard-stat-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      <p>{note}</p>
    </div>
  );
}

function BarRow({ label, value, percent }) {
  return (
    <div className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <div className="dashboard-bar-track">
        <span style={{ width: `${Math.max(percent, 4)}%` }}></span>
      </div>
    </div>
  );
}

function DashboardList({ title, label, items, emptyText, renderItem }) {
  return (
    <div className="dashboard-panel">
      <div className="dashboard-section-header">
        <span>{label}</span>
        <h2>{title}</h2>
      </div>

      <div className="dashboard-list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Fragment key={item.id || index}>
              {renderItem(item)}
            </Fragment>
          ))
        ) : (
          <p className="dashboard-empty-text">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
