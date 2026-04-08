import { Link } from "react-router-dom";
import VideoShelfSection from "../VideoShelfSection.jsx";
import {
  getPopularVideos,
  getPreferredSubject,
  getRecommendedVideos
} from "../../utils/recommendations.js";
import {
  formatRelativeDeadline,
  getActivitySnapshot,
  getDashboardNarrative,
  getLatestVideo,
  getSubjectMomentum,
  getUpcomingInternships
} from "../../utils/dashboardInsights.js";

function UserDashboardView({
  currentUser,
  videos,
  internships,
  error,
  bookmarks,
  recentViews,
  isBookmarked,
  toggleBookmark,
  clearRecentViews
}) {
  const videosById = new Map(videos.map((video) => [Number(video.id), video]));
  const savedVideos = bookmarks
    .map((entry) => videosById.get(entry.id))
    .filter(Boolean);
  const recentVideos = recentViews
    .map((entry) => videosById.get(entry.id))
    .filter(Boolean);
  const recommendedVideos = getRecommendedVideos({
    videos,
    bookmarks,
    recentViews,
    limit: 4
  });
  const popularVideos = getPopularVideos(videos, 4);
  const preferredSubject = getPreferredSubject({
    videos,
    bookmarks,
    recentViews
  });
  const activitySnapshot = getActivitySnapshot({
    bookmarks,
    recentViews
  });
  const latestVideo = getLatestVideo(videos);
  const upcomingInternships = getUpcomingInternships(internships, 3);
  const subjectMomentum = getSubjectMomentum({
    videos,
    bookmarks,
    recentViews,
    limit: 4
  });
  const dashboardNarrative = getDashboardNarrative({
    preferredSubject,
    recentVideos,
    savedVideos,
    upcomingInternships,
    latestVideo
  });
  const displayName =
    currentUser?.fullName ||
    currentUser?.full_name ||
    currentUser?.name ||
    "Student";
  const focusArea =
    preferredSubject === "Still learning your preferences"
      ? "Explore the library"
      : preferredSubject;
  const latestRecentVideo = recentVideos[0] || null;
  const latestSavedVideo = savedVideos[0] || null;
  const nextDeadline = upcomingInternships[0] || null;
  const trendingTitle = popularVideos[0]?.title || "No content yet";

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">Personal dashboard</span>
          <h1>{displayName}&apos;s StudyHub Dashboard</h1>
          <p>
            Track your learning rhythm, continue saved work quickly, and keep
            internship deadlines visible from one focused space.
          </p>
          <p className="dashboard-hero-note">{dashboardNarrative}</p>

          <div className="dashboard-quick-links">
            {latestRecentVideo && (
              <Link
                to={`/video/${latestRecentVideo.id}`}
                className="dashboard-quick-link"
              >
                Continue latest session
              </Link>
            )}

            {latestSavedVideo && (
              <Link
                to={`/video/${latestSavedVideo.id}`}
                className="dashboard-quick-link"
              >
                Open saved pick
              </Link>
            )}

            {nextDeadline && (
              <Link
                to={`/internships/details/${nextDeadline.id}`}
                className="dashboard-quick-link"
              >
                Review next deadline
              </Link>
            )}
          </div>
        </div>

        <aside className="dashboard-hero-panel">
          <span className="dashboard-panel-label">Study Pulse</span>

          <div className="dashboard-panel-grid">
            <div className="dashboard-panel-item">
              <span>Library size</span>
              <strong>{videos.length}</strong>
              <p>
                {latestVideo ? `Latest: ${latestVideo.subject}` : "Waiting for content"}
              </p>
            </div>

            <div className="dashboard-panel-item">
              <span>Focus area</span>
              <strong>{focusArea}</strong>
              <p>
                Built from {recentVideos.length} recent views and {savedVideos.length} saved
                items
              </p>
            </div>

            <div className="dashboard-panel-item">
              <span>Career radar</span>
              <strong>
                {nextDeadline
                  ? formatRelativeDeadline(nextDeadline.deadline)
                  : "No deadlines"}
              </strong>
              <p>
                {nextDeadline
                  ? nextDeadline.title
                  : "Internship board is clear for now"}
              </p>
            </div>

            <div className="dashboard-panel-item">
              <span>Last active</span>
              <strong>{activitySnapshot.lastActiveLabel}</strong>
              <p>{activitySnapshot.engagementLabel} study rhythm this week</p>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/" className="dashboard-link">
              Explore Library
            </Link>

            <Link to="/internships" className="upload-link">
              Browse Internships
            </Link>
          </div>
        </aside>
      </div>

      <div className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Saved items</span>
          <strong className="dashboard-stat-value">{savedVideos.length}</strong>
          <p>Your shortlist for revision and quick-return study sessions.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Recently watched</span>
          <strong className="dashboard-stat-value">{recentVideos.length}</strong>
          <p>Resume your last sessions without searching the library again.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Recommended now</span>
          <strong className="dashboard-stat-value">{recommendedVideos.length}</strong>
          <p>Fresh picks based on your current study behavior.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Preferred subject</span>
          <strong className="dashboard-stat-value dashboard-stat-value-text">
            {focusArea}
          </strong>
          <p>Your strongest current signal across saves and recent views.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Open internships</span>
          <strong className="dashboard-stat-value">{internships.length}</strong>
          <p>Live opportunities connected to your study journey.</p>
        </article>

        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Trending now</span>
          <strong className="dashboard-stat-value dashboard-stat-value-text">
            {trendingTitle}
          </strong>
          <p>Most visible content in the current library mix.</p>
        </article>
      </div>

      {error && <p className="error-text dashboard-feedback">{error}</p>}

      <div className="dashboard-insights-grid">
        <section className="dashboard-focus-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Subject Momentum</h2>
              <p>See which topics dominate your activity and the wider library.</p>
            </div>

            <Link
              to={latestRecentVideo ? `/video/${latestRecentVideo.id}` : "/"}
              className="dashboard-inline-link"
            >
              {latestRecentVideo ? "Continue Latest" : "Browse Videos"}
            </Link>
          </div>

          <div className="dashboard-focus-strip">
            <article className="dashboard-focus-pill">
              <span>Last active</span>
              <strong>{activitySnapshot.lastActiveLabel}</strong>
              <p>Most recent saved or watched signal</p>
            </article>

            <article className="dashboard-focus-pill">
              <span>Sessions this week</span>
              <strong>{activitySnapshot.recentViewsThisWeek}</strong>
              <p>{activitySnapshot.activeDays} active day(s) tracked locally</p>
            </article>

            <article className="dashboard-focus-pill">
              <span>Saves this week</span>
              <strong>{activitySnapshot.savesThisWeek}</strong>
              <p>{activitySnapshot.engagementLabel} momentum in the last 7 days</p>
            </article>
          </div>

          {subjectMomentum.length > 0 ? (
            <div className="dashboard-momentum-list">
              {subjectMomentum.map((item) => (
                <article key={item.subject} className="dashboard-momentum-item">
                  <div className="dashboard-momentum-head">
                    <div>
                      <h3>{item.subject}</h3>
                      <p>{item.libraryCount} videos in the library</p>
                    </div>

                    <strong>
                      {item.engagementScore > 0
                        ? `${item.engagementScore} activity pts`
                        : `${item.libraryCount} available`}
                    </strong>
                  </div>

                  <div className="dashboard-meter" aria-hidden="true">
                    <span
                      className="dashboard-meter-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p>Subject insights will appear as the library grows.</p>
            </div>
          )}
        </section>

        <section className="dashboard-focus-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Career Radar</h2>
              <p>Keep an eye on the closest internship deadlines from the same dashboard.</p>
            </div>

            <Link
              to={nextDeadline ? `/internships/details/${nextDeadline.id}` : "/internships"}
              className="dashboard-inline-link"
            >
              {nextDeadline ? "Open Next Deadline" : "View All"}
            </Link>
          </div>

          {upcomingInternships.length > 0 ? (
            <div className="dashboard-mini-list">
              {upcomingInternships.map((internship) => {
                const internshipId = internship.id || internship._id;
                const internshipMeta =
                  internship.location && internship.location !== "Remote"
                    ? `${internship.company} - ${internship.location}`
                    : `${internship.company} - ${internship.location || "Flexible"}`;

                return (
                  <article key={internshipId} className="dashboard-mini-card">
                    <div className="dashboard-mini-top">
                      <span className="dashboard-mini-type">
                        {internship.category || internship.type || "Internship"}
                      </span>
                      <span className="dashboard-deadline-pill">
                        {formatRelativeDeadline(internship.deadline)}
                      </span>
                    </div>

                    <h3>{internship.title}</h3>
                    <p>{internshipMeta}</p>

                    <Link
                      to={`/internships/details/${internshipId}`}
                      className="dashboard-inline-link"
                    >
                      Open Posting
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p>No internship posts are available yet.</p>
            </div>
          )}
        </section>
      </div>

      <VideoShelfSection
        title="Recently Watched"
        description="Your latest viewed videos stay here for quick return access."
        videos={recentVideos}
        emptyMessage="Open a video to start building your recently watched list."
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
        action={
          recentViews.length > 0 ? (
            <button
              type="button"
              className="dashboard-action-button"
              onClick={clearRecentViews}
            >
              Clear History
            </button>
          ) : null
        }
      />

      <VideoShelfSection
        title="Saved / Bookmarked Items"
        description="Your manually saved videos live here for fast access."
        videos={savedVideos}
        emptyMessage="Save videos from the home page or details page to build your personal collection."
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />

      <VideoShelfSection
        title="Recommended For You"
        description="Suggestions based on your recent activity and saved subjects."
        videos={recommendedVideos}
        emptyMessage="Watch or save a few videos to unlock more tailored recommendations."
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />

      <VideoShelfSection
        title="Popular Content"
        description="Top-performing videos by views, rating, and freshness."
        videos={popularVideos}
        emptyMessage="Popular videos will appear here when content is available."
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />
    </div>
  );
}

export default UserDashboardView;
