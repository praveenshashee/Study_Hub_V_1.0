import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import StatusPanel from "../components/StatusPanel.jsx";
import { formatCompactNumber, formatFullDate } from "../lib/format.js";

export default function VideoDetailsPage({ appState }) {
  const {
    videos,
    isLoading,
    loadError,
    isBookmarked,
    toggleBookmark,
    markVideoAsWatched,
    deleteVideo,
    incrementViews
  } = appState;
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const hasTrackedView = useRef(false);

  const numericVideoId = Number(videoId);
  const video = videos.find((entry) => entry.id === numericVideoId);

  useEffect(() => {
    if (!video || hasTrackedView.current) {
      return;
    }

    const visitKey = `studyHub:view:${location.key}:${video.id}`;

    try {
      if (window.sessionStorage.getItem(visitKey)) {
        hasTrackedView.current = true;
        return;
      }

      window.sessionStorage.setItem(visitKey, "1");
    } catch {
      // Ignore sessionStorage failures and still keep the page usable.
    }

    hasTrackedView.current = true;
    markVideoAsWatched(video);
    incrementViews(video.id).catch((error) => {
      console.error("Failed to increment video views:", error);
    });
    // The ref intentionally keeps this from replaying when unrelated props change.
  }, [video, location.key, incrementViews, markVideoAsWatched]);

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this video?");

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");
      await deleteVideo(numericVideoId);
      navigate("/");
    } catch (error) {
      setDeleteError(error.message || "Failed to delete the resource.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!Number.isInteger(numericVideoId) || numericVideoId <= 0) {
    return (
      <StatusPanel
        tone="error"
        title="Invalid video id"
        description="The selected resource could not be found."
      />
    );
  }

  if (isLoading && !video) {
    return (
      <StatusPanel
        title="Loading resource details"
        description="Pulling the latest video information from the Node backend."
      />
    );
  }

  if (loadError && !video) {
    return (
      <StatusPanel
        tone="error"
        title="Unable to load this resource"
        description={loadError}
      />
    );
  }

  if (!video) {
    return (
      <StatusPanel
        tone="error"
        title="Video not found"
        description="This resource may have been deleted or the link is out of date."
      />
    );
  }

  const resources = [
    ["Lecture slides", video.materials?.slides],
    ["Lab sheet", video.materials?.labSheet],
    ["Model paper", video.materials?.modelPaper]
  ];

  return (
    <div className="page-stack">
      <section className="detail-layout">
        <article className="detail-card">
          <div className="detail-header">
            <div>
              <p className="section-kicker">Learning resource</p>
              <h1>{video.title}</h1>
            </div>
            <button
              type="button"
              className={isBookmarked(video.id) ? "secondary-button active" : "secondary-button"}
              onClick={() => toggleBookmark(video.id)}
            >
              {isBookmarked(video.id) ? "Saved" : "Save"}
            </button>
          </div>

          <p className="detail-description">{video.description}</p>

          <div className="detail-meta-grid">
            <div className="summary-card">
              <span>Subject</span>
              <strong>{video.subject}</strong>
            </div>
            <div className="summary-card">
              <span>Views</span>
              <strong>{formatCompactNumber(video.views)}</strong>
            </div>
            <div className="summary-card">
              <span>Rating</span>
              <strong>{video.rating.toFixed(1)}</strong>
            </div>
            <div className="summary-card">
              <span>Published</span>
              <strong>{formatFullDate(video.createdAt)}</strong>
            </div>
          </div>

          <div className="resource-block">
            <h2>Study materials</h2>
            <div className="resource-list">
              {resources.map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  className="resource-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{label}</span>
                  <strong>Open</strong>
                </a>
              ))}
            </div>
          </div>

          {deleteError ? (
            <div className="inline-banner error">{deleteError}</div>
          ) : null}

          <div className="action-row">
            <a className="primary-button" href={video.videoUrl} target="_blank" rel="noreferrer">
              Watch video
            </a>
            <Link className="secondary-button" to={`/videos/${video.id}/edit`}>
              Edit resource
            </Link>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>

        <aside className="summary-card video-preview-card">
          <p className="section-kicker">Quick overview</p>
          <h2>{video.uploader}</h2>
          <p className="muted-copy">
            Open the source video in a new tab and use the linked materials to keep the learning
            session moving.
          </p>
          <div className="preview-metadata">
            <div className="summary-row">
              <span>Uploader</span>
              <strong>{video.uploader}</strong>
            </div>
            <div className="summary-row">
              <span>Subject</span>
              <strong>{video.subject}</strong>
            </div>
            <div className="summary-row">
              <span>Materials</span>
              <strong>{resources.length}</strong>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
