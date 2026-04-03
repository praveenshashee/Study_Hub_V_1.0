import { useDeferredValue, useState } from "react";
import VideoCard from "../components/VideoCard.jsx";
import StatusPanel from "../components/StatusPanel.jsx";
import { formatCompactNumber } from "../lib/format.js";

function sortVideos(videos, sortBy) {
  const nextVideos = [...videos];

  if (sortBy === "latest") {
    nextVideos.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  } else if (sortBy === "views") {
    nextVideos.sort((left, right) => right.views - left.views);
  } else if (sortBy === "rating") {
    nextVideos.sort((left, right) => right.rating - left.rating);
  }

  return nextVideos;
}

export default function HomePage({ appState }) {
  const {
    videos,
    isLoading,
    loadError,
    personalizationState,
    isBookmarked,
    toggleBookmark
  } = appState;
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const deferredSearch = useDeferredValue(searchText);

  const filteredVideos = videos.filter((video) => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      video.title.toLowerCase().includes(normalizedSearch) ||
      video.subject.toLowerCase().includes(normalizedSearch)
    );
  });

  const visibleVideos = sortVideos(filteredVideos, sortBy);
  const featuredVideo = visibleVideos[0] || videos[0] || null;
  const subjectCount = new Set(videos.map((video) => video.subject)).size;

  if (isLoading && videos.length === 0) {
    return (
      <StatusPanel
        title="Loading your React study library"
        description="Fetching your video resources and building the new dashboard experience."
      />
    );
  }

  if (loadError && videos.length === 0) {
    return (
      <StatusPanel
        tone="error"
        title="Unable to load Study Hub"
        description={loadError}
      />
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-surface">
        <div className="hero-copy">
          <p className="section-kicker">Modernized Frontend</p>
          <h1>Study resources, rebuilt as a React experience.</h1>
          <p className="hero-body">
            Search, sort, save, and explore academic videos from one single-page app powered by
            your existing Node and Express backend.
          </p>

          <div className="hero-stat-grid">
            <div className="hero-stat-card">
              <span>Resources</span>
              <strong>{videos.length}</strong>
            </div>
            <div className="hero-stat-card">
              <span>Subjects</span>
              <strong>{subjectCount}</strong>
            </div>
            <div className="hero-stat-card">
              <span>Saved</span>
              <strong>{personalizationState.bookmarkedIds.length}</strong>
            </div>
          </div>
        </div>

        <div className="hero-feature-card">
          <p className="feature-eyebrow">Featured resource</p>
          {featuredVideo ? (
            <>
              <h2>{featuredVideo.title}</h2>
              <p>{featuredVideo.description}</p>
              <div className="feature-metadata">
                <span>{featuredVideo.subject}</span>
                <span>{formatCompactNumber(featuredVideo.views)} views</span>
                <span>{featuredVideo.rating.toFixed(1)} rating</span>
              </div>
            </>
          ) : (
            <p>Start by uploading your first learning resource.</p>
          )}
        </div>
      </section>

      <section className="toolbar">
        <label className="search-field">
          <span>Search by title or subject</span>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Type to filter videos..."
          />
        </label>

        <label className="select-field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="default">Default</option>
            <option value="latest">Latest</option>
            <option value="views">Most viewed</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>
      </section>

      {loadError ? (
        <div className="inline-banner error">{loadError}</div>
      ) : null}

      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Library</p>
            <h2>{visibleVideos.length} matching resources</h2>
          </div>
          <p>Everything below is now rendered through reusable React components.</p>
        </div>

        {visibleVideos.length > 0 ? (
          <div className="video-grid">
            {visibleVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                bookmarked={isBookmarked(video.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No videos matched your current search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
