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

  return (
    <div className="home-container">
      <header className="page-header">
        <h1>StudyHub Videos</h1>
        <p>Browse, manage, and explore academic video resources.</p>
      </header>

      <div className="controls">
        {/* Search videos by title */}
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

        {/* Subject filter dropdown with label */}
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

        {/* Sort dropdown with label */}
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

        {/* Upload button for admin use only */}
        {!authLoading && currentUser?.role === "admin" && (
          <Link to="/upload" className="upload-link">
            + Upload New Video
          </Link>
        )}
      </div>

      {loading && <p>Loading videos...</p>}
      {error && <p>{error}</p>}

      <div className="video-list">
        {sortedVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;