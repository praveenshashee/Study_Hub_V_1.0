import { Link } from "react-router-dom";

function VideoCard({ video }) {
  return (
    <div className="video-card">
      <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />

      <h3>{video.title}</h3>
      <p><strong>Subject:</strong> {video.subject}</p>
      <p>{video.description}</p>
      <p><strong>Uploader:</strong> {video.uploader}</p>
      <p><strong>Views:</strong> {video.views}</p>
      <p><strong>Rating:</strong> {video.rating}</p>

      <Link to={`/video/${video.id}`} className="details-link">
        View Details
      </Link>
    </div>
  );
}

export default VideoCard;