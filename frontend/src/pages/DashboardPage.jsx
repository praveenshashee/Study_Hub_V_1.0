import { useState } from "react";
import { Link } from "react-router-dom";
import ShelfSection from "../components/ShelfSection.jsx";
import StatusPanel from "../components/StatusPanel.jsx";
import { formatCompactNumber, formatRelativeTime } from "../lib/format.js";

function filterBySubject(videos, subject) {
  if (subject === "All") {
    return videos;
  }

  return videos.filter((video) => video.subject === subject);
}

export default function DashboardPage({ appState }) {
  const {
    videos,
    isLoading,
    loadError,
    dashboardData,
    isBookmarked,
    toggleBookmark
  } = appState;
  const [activeSubject, setActiveSubject] = useState("All");

  if (isLoading && videos.length === 0) {
    return (
      <StatusPanel
        title="Building your dashboard"
        description="Loading recent activity, bookmarks, and personalized recommendations."
      />
    );
  }

  if (loadError && videos.length === 0) {
    return (
      <StatusPanel
        tone="error"
        title="The dashboard is unavailable"
        description={loadError}
      />
    );
  }

  if (videos.length === 0) {
    return (
      <StatusPanel
        title="No resources yet"
        description="Upload your first video resource to unlock the personalized dashboard."
      />
    );
  }

  const heroVideo = dashboardData.heroVideo;
  const subjectOptions = [
    "All",
    ...new Set([
      ...dashboardData.favoriteSubjects,
      ...videos.map((video) => video.subject)
    ])
  ];

  const progressById = Object.fromEntries(
    dashboardData.recentlyWatched.map((video) => [video.id, video.progress])
  );

  return (
    <div className="page-stack dashboard-stack">
      <section className="hero-surface dashboard-hero">
        <div className="hero-copy">
          <p className="section-kicker">Study dashboard</p>
          <h1>Your learning feed is now one connected React workspace.</h1>
          <p className="hero-body">
            Keep momentum with personalized recommendations, quick resume points, and bookmark
            driven subject discovery.
          </p>

          <div className="hero-stat-grid">
            <div className="hero-stat-card">
              <span>Continue watching</span>
              <strong>{dashboardData.stats.watchedCount}</strong>
            </div>
            <div className="hero-stat-card">
              <span>Saved videos</span>
              <strong>{dashboardData.stats.savedCount}</strong>
            </div>
            <div className="hero-stat-card">
              <span>Recommendations</span>
              <strong>{dashboardData.stats.recommendationCount}</strong>
            </div>
            <div className="hero-stat-card">
              <span>Popular now</span>
              <strong>{dashboardData.stats.popularCount}</strong>
            </div>
          </div>
        </div>

        {heroVideo ? (
          <div className="hero-feature-card">
            <p className="feature-eyebrow">Next best pick</p>
            <h2>{heroVideo.title}</h2>
            <p>{heroVideo.description}</p>
            <div className="feature-metadata">
              <span>{heroVideo.subject}</span>
              <span>{formatCompactNumber(heroVideo.views)} views</span>
              <span>
                {"progress" in heroVideo ? `${heroVideo.progress}% complete` : "Recommended"}
              </span>
            </div>
            <div className="action-row">
              <Link className="primary-button" to={`/videos/${heroVideo.id}`}>
                Open resource
              </Link>
              <button
                type="button"
                className={isBookmarked(heroVideo.id) ? "secondary-button active" : "secondary-button"}
                onClick={() => toggleBookmark(heroVideo.id)}
              >
                {isBookmarked(heroVideo.id) ? "Saved" : "Save for later"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Tune your feed</p>
            <h2>Focus on the subjects you care about right now</h2>
          </div>
          <p>Your shelves update instantly as you change the active subject filter.</p>
        </div>

        <div className="chip-row">
          {subjectOptions.map((subject) => (
            <button
              key={subject}
              type="button"
              className={activeSubject === subject ? "subject-chip active" : "subject-chip"}
              onClick={() => setActiveSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <ShelfSection
            id="continue-watching"
            title="Continue watching"
            subtitle="Jump back into the videos you already started."
            videos={filterBySubject(dashboardData.recentlyWatched, activeSubject)}
            emptyMessage="Watch a few videos to build your continue-watching row."
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            progressById={progressById}
          />

          <ShelfSection
            id="watch-later"
            title="Saved to watch later"
            subtitle="Your bookmarks stay synced through local personalization state."
            videos={filterBySubject(dashboardData.bookmarkedVideos, activeSubject)}
            emptyMessage="Save a few videos from the home page to see them here."
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
          />

          <ShelfSection
            id="recommended"
            title="Recommended for you"
            subtitle="Generated from what you saved and what you watched recently."
            videos={filterBySubject(dashboardData.recommended, activeSubject)}
            emptyMessage="Keep watching and bookmarking videos to unlock recommendations."
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
          />

          <ShelfSection
            id="popular"
            title="Popular right now"
            subtitle="The most watched resources across your current library."
            videos={filterBySubject(dashboardData.popular, activeSubject)}
            emptyMessage="Popular resources will appear here when your library grows."
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
          />
        </div>

        <aside className="dashboard-side">
          <section className="summary-card">
            <p className="section-kicker">Top subjects</p>
            <h3>What your study habits are telling us</h3>
            <div className="summary-list">
              {dashboardData.favoriteSubjects.length > 0 ? (
                dashboardData.favoriteSubjects.map((subject) => (
                  <div key={subject} className="summary-row">
                    <span>{subject}</span>
                    <strong>Trending</strong>
                  </div>
                ))
              ) : (
                <p className="muted-copy">Not enough activity yet. Start watching to personalize this area.</p>
              )}
            </div>
          </section>

          <section className="summary-card">
            <p className="section-kicker">Recent activity</p>
            <h3>Last watched resources</h3>
            <div className="activity-list">
              {dashboardData.recentlyWatched.length > 0 ? (
                dashboardData.recentlyWatched.map((video) => (
                  <div key={video.id} className="activity-item">
                    <div>
                      <strong>{video.title}</strong>
                      <p>{video.subject}</p>
                    </div>
                    <span>{formatRelativeTime(video.watchedAt)}</span>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No recent activity yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
