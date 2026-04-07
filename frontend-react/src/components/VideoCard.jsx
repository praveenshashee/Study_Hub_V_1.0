import { Link } from "react-router-dom";
import BookmarkButton from "./BookmarkButton.jsx";

function VideoCard({ video, isBookmarked = false, onToggleBookmark }) {
  const canToggleBookmark = typeof onToggleBookmark === "function";

  return (
    <Link to={`/video/${video.id}`} className="video-card-link">
      <article className="video-card">
      <div className="video-thumb-wrap">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="video-thumb"
        />
        <span className="video-subject-badge">{video.subject}</span>

        {canToggleBookmark && (
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={onToggleBookmark}
          />
        )}
      </div>

      <div className="video-card-body">
        <h3>{video.title}</h3>

        <div className="video-meta">
          <span>{video.views} views</span>
          <span>{video.rating} rating</span>
        </div>

        <p className="video-date">Added on {video.createdAt}</p>
      </div>
    </article>
    </Link>
  );
}

export default VideoCard;
