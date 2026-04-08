import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AccessRequiredModal from "./AccessRequiredModal";

function VideoCard({ video, currentUser }) {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    e.preventDefault();

    if (!currentUser) {
      setShowAccessModal(true);
      return;
    }

    navigate(`/video/${video.id}`);
  };

  return (
    <>
      <Link
        to={`/video/${video.id}`}
        className="video-card-link"
        onClick={handleCardClick}
      >
        <div className="video-card">
          <div className="video-thumb-wrap">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="video-thumb"
            />
            <span className="video-subject-badge">{video.subject}</span>
          </div>

          <div className="video-card-body">
            <h3>{video.title}</h3>

            <div className="video-meta">
              <span>{video.views} views</span>
              <span>{video.rating} rating</span>
            </div>

            <p className="video-date">{video.createdAt}</p>
          </div>
        </div>
      </Link>

      <AccessRequiredModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        featureName="full video details and study materials"
      />
    </>
  );
}

export default VideoCard;