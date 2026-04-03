import { Link } from "react-router-dom";
import { buildSubjectGradient, formatCompactNumber, formatFullDate } from "../lib/format.js";

export default function VideoCard({
  video,
  bookmarked,
  onToggleBookmark,
  variant = "default",
  progress
}) {
  const thumbnailStyle = {
    backgroundImage: `${buildSubjectGradient(video.subject)}, url(${video.thumbnailUrl})`
  };

  return (
    <article className={`video-card ${variant === "compact" ? "compact" : ""}`}>
      <div className="card-thumbnail" style={thumbnailStyle}>
        <div className="thumbnail-overlay">
          <span className="subject-pill">{video.subject}</span>
          <span className="thumbnail-caption">{video.uploader}</span>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{video.title}</h3>
          <button
            type="button"
            className={bookmarked ? "bookmark-btn active" : "bookmark-btn"}
            onClick={() => onToggleBookmark(video.id)}
          >
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>

        <p className="card-description">{video.description}</p>

        <dl className="card-metadata">
          <div>
            <dt>Views</dt>
            <dd>{formatCompactNumber(video.views)}</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>{video.rating.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Added</dt>
            <dd>{formatFullDate(video.createdAt)}</dd>
          </div>
        </dl>

        {typeof progress === "number" ? (
          <div className="progress-block">
            <div className="progress-copy">
              <span>Progress</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <div className="card-footer">
          <Link className="card-link" to={`/videos/${video.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
