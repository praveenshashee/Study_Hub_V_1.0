import { Link } from "react-router-dom";
import { formatRelativeDeadline } from "../../utils/dashboardInsights.js";
import {
  countCreatedWithin,
  countDeadlinesWithin,
  formatDisplayDate,
  getAverageRating,
  getMostRepresentedSubject,
  getTotalViews
} from "./dashboardHelpers.js";

const getAdminNarrative = ({
  notifications,
  upcomingInternships,
  latestVideo
}) => {
  if (notifications.length > 0) {
    return `${notifications.length} student submissions are available for review. Clear the queue and keep the internship pipeline moving.`;
  }

  if (upcomingInternships.length > 0) {
    return `The next internship deadline is ${formatRelativeDeadline(
      upcomingInternships[0].deadline
    )}. Keep the board updated while student traffic is low.`;
  }

  if (latestVideo?.title) {
    return `Your latest library addition is "${latestVideo.title}". Use the admin dashboard to keep content and career workflows aligned.`;
  }

  return "Use this dashboard to manage library growth, track internships, and monitor student submissions in one place.";
};

function AdminDashboardView({
  currentUser,
  videos,
  internships,
  notifications,
  error,
  latestVideo,
  upcomingInternships,
  popularVideos
}) {
  const latestNotification = notifications[0] || null;
  const totalViews = getTotalViews(videos);
  const averageRating = getAverageRating(videos).toFixed(1);
  const uploadsThisMonth = countCreatedWithin(videos, "createdAt", 30);
  const deadlinesSoon = countDeadlinesWithin(internships, 14);
  const notificationsThisWeek = countCreatedWithin(
    notifications,
    "created_at",
    7
  );
  const strongestSubject = getMostRepresentedSubject(videos);
  const adminNarrative = getAdminNarrative({
    notifications,
    upcomingInternships,
    latestVideo
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">Admin operations dashboard</span>
          <h1>{currentUser?.fullName || "Admin"} Control Center</h1>
          <p>
            Monitor content performance, internship operations, and student
            submissions from one place.
          </p>
          <p className="dashboard-hero-note">{adminNarrative}</p>

          <div className="dashboard-quick-links">
            <Link to="/upload" className="dashboard-quick-link">
              Upload video
            </Link>
            <Link to="/internships/add" className="dashboard-quick-link">
              Add internship
            </Link>
            <Link
              to="/internships/notifications"
              className="dashboard-quick-link"
            >
              Open notifications
            </Link>
          </div>
        </div>

        <aside className="dashboard-hero-panel">
          <span className="dashboard-panel-label">Control Pulse</span>

          <div className="dashboard-panel-grid">
            <div className="dashboard-panel-item">
              <span>Video library</span>
              <strong>{videos.length}</strong>
              <p>{latestVideo ? `Latest: ${latestVideo.title}` : "No uploads yet"}</p>
            </div>

            <div className="dashboard-panel-item">
              <span>Internship board</span>
              <strong>{internships.length}</strong>
              <p>{deadlinesSoon} deadlines due in the next 14 days</p>
            </div>

            <div className="dashboard-panel-item">
              <span>Review queue</span>
              <strong>{notifications.length}</strong>
              <p>
                {latestNotification
                  ? `${latestNotification.student_name} submitted the latest form`
                  : "No student submissions yet"}
              </p>
            </div>

            <div className="dashboard-panel-item">
              <span>Average rating</span>
              <strong>{averageRating}</strong>
              <p>{totalViews} total views across the video library</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Total views</span>
          <strong className="dashboard-stat-value">{totalViews}</strong>
          <p>Total consumption across all published videos.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Average rating</span>
          <strong className="dashboard-stat-value">{averageRating}</strong>
          <p>Current average score across the video library.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">New uploads</span>
          <strong className="dashboard-stat-value">{uploadsThisMonth}</strong>
          <p>Videos added in the last 30 days.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Deadlines soon</span>
          <strong className="dashboard-stat-value">{deadlinesSoon}</strong>
          <p>Internships closing within the next two weeks.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">New submissions</span>
          <strong className="dashboard-stat-value">{notificationsThisWeek}</strong>
          <p>Student forms received in the last 7 days.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Largest subject</span>
          <strong className="dashboard-stat-value dashboard-stat-value-text">
            {strongestSubject}
          </strong>
          <p>Most represented topic in the current video library.</p>
        </article>
      </div>

      {error && <p className="error-text dashboard-feedback">{error}</p>}

      <div className="dashboard-insights-grid">
        <section className="dashboard-focus-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Content Watchlist</h2>
              <p>Review the strongest library performers and jump into details.</p>
            </div>

            <Link to="/" className="dashboard-inline-link">
              Open library
            </Link>
          </div>

          {popularVideos.length > 0 ? (
            <div className="dashboard-admin-list">
              {popularVideos.map((video) => (
                <article key={video.id} className="dashboard-admin-item">
                  <div className="dashboard-admin-top">
                    <span className="dashboard-admin-pill">{video.subject}</span>
                    <strong>{video.views} views</strong>
                  </div>

                  <h3>{video.title}</h3>
                  <p>
                    Rated {video.rating} and added on {formatDisplayDate(video.createdAt)}
                  </p>

                  <Link
                    to={`/video/${video.id}`}
                    className="dashboard-inline-link"
                  >
                    Open video
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p>No video analytics are available yet.</p>
            </div>
          )}
        </section>

        <section className="dashboard-focus-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Submission Queue</h2>
              <p>Latest student-submitted internship forms waiting for review.</p>
            </div>

            <Link
              to="/internships/notifications"
              className="dashboard-inline-link"
            >
              Open queue
            </Link>
          </div>

          {notifications.length > 0 ? (
            <div className="dashboard-admin-list">
              {notifications.slice(0, 4).map((notification) => (
                <article
                  key={notification.id}
                  className="dashboard-admin-item"
                >
                  <div className="dashboard-admin-top">
                    <span className="dashboard-admin-pill">
                      {notification.category || "General"}
                    </span>
                    <strong>{formatDisplayDate(notification.created_at)}</strong>
                  </div>

                  <h3>{notification.internship_title}</h3>
                  <p>
                    Submitted by {notification.student_name} for {notification.company}
                  </p>

                  <Link
                    to="/internships/notifications"
                    className="dashboard-inline-link"
                  >
                    Review item
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p>No internship notifications are waiting for review.</p>
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Opportunity Pipeline</h2>
            <p>Track the next internship deadlines and open postings.</p>
          </div>

          <Link to="/internships" className="dashboard-inline-link">
            Manage internships
          </Link>
        </div>

        {upcomingInternships.length > 0 ? (
          <div className="dashboard-mini-list">
            {upcomingInternships.map((internship) => (
              <article key={internship.id} className="dashboard-mini-card">
                <div className="dashboard-mini-top">
                  <span className="dashboard-mini-type">
                    {internship.category || internship.type || "Internship"}
                  </span>
                  <span className="dashboard-deadline-pill">
                    {formatRelativeDeadline(internship.deadline)}
                  </span>
                </div>

                <h3>{internship.title}</h3>
                <p>
                  {internship.company} - {internship.location || "Flexible"}
                </p>

                <Link
                  to={`/internships/details/${internship.id}`}
                  className="dashboard-inline-link"
                >
                  Open posting
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>No internship deadlines are currently available.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboardView;
