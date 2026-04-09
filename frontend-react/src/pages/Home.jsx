import { useEffect, useState } from "react";
import api from "../services/api.js";
import VideoCard from "../components/VideoCard";
import { Link } from "react-router-dom";

function Home({ currentUser, authLoading }) {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get("/api/videos");
      setVideos(response.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  // Create a unique subject list for the subject filter dropdown
  const subjectOptions = [
    "All Subjects",
    ...new Set(videos.map((video) => video.subject).filter(Boolean))
  ];

  // Filter videos by both search term and selected subject
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSubject =
      subjectFilter === "All Subjects" || video.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortOption === "title-asc") {
      return a.title.localeCompare(b.title);
    }

    if (sortOption === "title-desc") {
      return b.title.localeCompare(a.title);
    }

    if (sortOption === "views-asc") {
      return a.views - b.views;
    }

    if (sortOption === "views-desc") {
      return b.views - a.views;
    }

    if (sortOption === "date-newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortOption === "date-oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    return 0;
  });

  const featuredSubjects = subjectOptions
    .filter((subject) => subject !== "All Subjects")
    .slice(0, 3);

  return (
    <main className="home-shell">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="landing-badge home-badge">Video Learning Library</span>

          <h1>
            Explore your
            <span className="landing-highlight"> Study Hub video space.</span>
          </h1>

          <p className="home-subtitle">
            Discover academic videos, filter topics quickly, and jump back into
            the resources that matter most for your coursework.
          </p>

          <div className="home-stats">
            <div className="landing-stat-card home-stat-card">
              <strong>{videos.length}</strong>
              <span>Total videos available</span>
            </div>

            <div className="landing-stat-card home-stat-card">
              <strong>{featuredSubjects.length || 0}</strong>
              <span>Featured subject areas</span>
            </div>

            <div className="landing-stat-card home-stat-card">
              <strong>{sortedVideos.length}</strong>
              <span>Results in your current view</span>
            </div>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="landing-glow landing-glow-one home-glow-one"></div>
          <div className="landing-glow landing-glow-two home-glow-two"></div>

          <div className="landing-panel home-highlight-panel">
            <div className="landing-panel-chip">Learning Snapshot</div>
            <h3>Search, filter, and pick up where you left off</h3>
            <p>
              Your main library now feels more like a polished dashboard while
              keeping every existing video action exactly the same.
            </p>

            <div className="home-feature-pills">
              <span>Fast Search</span>
              <span>Smart Filtering</span>
              <span>Admin Uploads</span>
            </div>
          </div>

          {featuredSubjects.map((subject, index) => (
            <div
              key={subject}
              className={`landing-floating-card home-floating-card home-floating-card-${index + 1}`}
            >
              <span>{subject}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-content">
        <div className="home-filter-panel">
          <div className="controls home-controls">
            <div className="control-group search-group">
              <label className="control-label">Search</label>
              <input
                type="text"
                placeholder="Search videos by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="control-group">
              <label className="control-label">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="subject-select"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="">Default Order</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="views-asc">Views Low to High</option>
                <option value="views-desc">Views High to Low</option>
                <option value="date-newest">Newest First</option>
                <option value="date-oldest">Oldest First</option>
              </select>
            </div>

            {!authLoading && currentUser?.role === "admin" && (
              <Link to="/upload" className="upload-link home-upload-link">
                + Upload New Video
              </Link>
            )}
          </div>

          <div className="home-results-bar">
            <p className="home-results-text">
              Showing <strong>{sortedVideos.length}</strong> video
              {sortedVideos.length === 1 ? "" : "s"}
              {subjectFilter !== "All Subjects" ? ` in ${subjectFilter}` : ""}.
            </p>

            <div className="home-chip-row">
              {featuredSubjects.map((subject) => (
                <span key={subject} className="home-topic-chip">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>

        {loading && <p className="page-message">Loading videos...</p>}
        {error && <p className="error-text home-feedback">{error}</p>}

        {!loading && !error && sortedVideos.length === 0 && (
          <div className="home-empty-state">
            <h3>No videos match your current filters</h3>
            <p>Try another search term or switch back to all subjects.</p>
          </div>
        )}

        <div className="video-list home-video-list">
          {sortedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              currentUser={currentUser}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
