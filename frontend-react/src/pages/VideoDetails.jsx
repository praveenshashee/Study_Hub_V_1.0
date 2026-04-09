import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const recentViewTracker = {};

function VideoDetails({ currentUser, authLoading }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  useEffect(() => {
    loadVideo();
  }, [id]);

  useEffect(() => {
    if (!authLoading && currentUser?.role === "user") {
      loadUserRating();
    } else {
      setUserRating(null);
    }
  }, [id, currentUser, authLoading]);

  const loadVideo = async () => {
    setLoading(true);
    setError("");

    const now = Date.now();
    const lastViewTime = recentViewTracker[id];

    try {
      let response;

      // Skip only very recent duplicate calls (like React StrictMode dev remount)
      if (lastViewTime && now - lastViewTime < 500) {
        response = await api.get(`/api/videos/${id}`);
      } else {
        recentViewTracker[id] = now;
        response = await api.patch(`/api/videos/${id}/view`);
      }

      setVideo(response.data);
    } catch (err) {
      console.error("Failed to load video details:", err);
      setError("Failed to load video details");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    try {
      const response = await api.get(`/api/videos/${id}/my-rating`);
      setUserRating(response.data.ratingValue);
    } catch (err) {
      console.error("Failed to load user rating:", err);
      setUserRating(null);
    }
  };

  const handleRateVideo = async (selectedRating) => {
    setRatingLoading(true);
    setRatingMessage("");

    try {
      const response = await api.post(`/api/videos/${id}/rate`, {
        ratingValue: selectedRating
      });

      setUserRating(selectedRating);
      setVideo(response.data.video);
      setRatingMessage("Rating submitted successfully");
    } catch (err) {
      console.error("Failed to submit rating:", err);
      setRatingMessage(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/videos/${id}`);
      delete recentViewTracker[id];
      alert("Video deleted successfully");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete video:", err);
      alert("Failed to delete video");
    }
  };

  if (loading) {
    return <p className="page-message">Loading video details...</p>;
  }

  if (error) {
    return <p className="page-message">{error}</p>;
  }

  if (!video) {
    return <p className="page-message">Video not found</p>;
  }

  return (
    <div className="details-container">
      <Link to="/home" className="back-link floating-back-link">{"<- Back to Home"}</Link>

      <h1>{video.title}</h1>
      <p><strong>Subject:</strong> {video.subject}</p>
      <p><strong>Description:</strong> {video.description}</p>
      <p><strong>Uploader:</strong> {video.uploader}</p>
      <p><strong>Views:</strong> {video.views}</p>
      <p><strong>Rating:</strong> {video.rating}</p>
      <p><strong>Created At:</strong> {video.createdAt}</p>

      <div className="video-player-section">
        <h2>Video Preview</h2>

        <video
          className="video-player"
          controls
          poster={video.thumbnailUrl}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {!authLoading && currentUser?.role === "user" && (
        <div className="rating-section">
          <h2>Rate This Video</h2>
          <p className="section-help">
            Click a star to rate this video from 1 to 5.
          </p>

          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${userRating >= star ? "active" : ""}`}
                onClick={() => handleRateVideo(star)}
                disabled={ratingLoading}
              >
                {"*"}
              </button>
            ))}
          </div>

          <p className="user-rating-text">
            Your rating: {userRating ? `${userRating}/5` : "Not rated yet"}
          </p>

          {ratingMessage && (
            <p
              className={
                ratingMessage.toLowerCase().includes("success")
                  ? "success-text"
                  : "error-text"
              }
            >
              {ratingMessage}
            </p>
          )}
        </div>
      )}

      <div className="materials-section">
        <h2>Materials</h2>
        <ul>
          <li>
            {video.materials?.labSheet ? (
              <a
                href={video.materials.labSheet}
                target="_blank"
                rel="noreferrer"
                className="material-link"
              >
                Open Lab Sheet
              </a>
            ) : (
              <span className="material-unavailable">Lab Sheet not available</span>
            )}
          </li>

          <li>
            {video.materials?.modelPaper ? (
              <a
                href={video.materials.modelPaper}
                target="_blank"
                rel="noreferrer"
                className="material-link"
              >
                Open Model Paper
              </a>
            ) : (
              <span className="material-unavailable">Model Paper not available</span>
            )}
          </li>
        </ul>
      </div>

      {!authLoading && currentUser?.role === "admin" && (
        <div className="page-actions">
          <Link to={`/edit/${video.id}`} className="edit-link">
            Edit Video
          </Link>

          <button onClick={handleDelete} className="delete-button">
            Delete Video
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoDetails;
