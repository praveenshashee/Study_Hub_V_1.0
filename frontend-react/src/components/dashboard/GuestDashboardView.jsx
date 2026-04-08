import { Link } from "react-router-dom";
import { formatRelativeDeadline } from "../../utils/dashboardInsights.js";

function GuestDashboardView({
  videos,
  internships,
  latestVideo,
  upcomingInternships,
  popularVideos
}) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">Role-based dashboard preview</span>
          <h1>Sign in to unlock your dashboard</h1>
          <p>
            User accounts get a personalized study dashboard. Admin accounts get
            an operations dashboard for content, internships, and notifications.
          </p>
          <p className="dashboard-hero-note">
            Log in and the dashboard will switch automatically to the right role.
          </p>

          <div className="dashboard-access-actions">
            <Link to="/login" className="dashboard-link">
              Login
            </Link>

            <Link to="/signup" className="upload-link">
              Create User Account
            </Link>
          </div>
        </div>

        <aside className="dashboard-hero-panel">
          <span className="dashboard-panel-label">Platform Snapshot</span>

          <div className="dashboard-panel-grid">
            <div className="dashboard-panel-item">
              <span>Library size</span>
              <strong>{videos.length}</strong>
              <p>{latestVideo ? `Latest: ${latestVideo.subject}` : "Waiting for content"}</p>
            </div>

            <div className="dashboard-panel-item">
              <span>Open internships</span>
              <strong>{internships.length}</strong>
              <p>Career opportunities currently visible on the platform</p>
            </div>

            <div className="dashboard-panel-item">
              <span>Trending video</span>
              <strong>{popularVideos[0]?.title || "No content yet"}</strong>
              <p>Most visible content from the current library</p>
            </div>

            <div className="dashboard-panel-item">
              <span>Next deadline</span>
              <strong>
                {upcomingInternships[0]
                  ? formatRelativeDeadline(upcomingInternships[0].deadline)
                  : "No deadlines"}
              </strong>
              <p>
                {upcomingInternships[0]
                  ? upcomingInternships[0].title
                  : "Internship board is currently clear"}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">User Dashboard</span>
          <strong className="dashboard-stat-value">Personalized</strong>
          <p>Saved videos, recent views, recommendations, and study momentum.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Admin Dashboard</span>
          <strong className="dashboard-stat-value">Operational</strong>
          <p>Content oversight, internship pipeline, and notification review.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Active Catalog</span>
          <strong className="dashboard-stat-value">{videos.length}</strong>
          <p>Videos currently available to both roles.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Career Board</span>
          <strong className="dashboard-stat-value">{internships.length}</strong>
          <p>Internship postings ready to browse.</p>
        </article>
      </div>
    </div>
  );
}

export default GuestDashboardView;
