import VideoCard from "./VideoCard";

function VideoShelfSection({
  title,
  description,
  videos,
  emptyMessage,
  onToggleBookmark,
  isBookmarked,
  action
}) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-heading">
        {(title || description) && (
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
        )}

        {action}
      </div>

      {videos.length > 0 ? (
        <div className="video-list">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isBookmarked={isBookmarked(video.id)}
              onToggleBookmark={() => onToggleBookmark(video.id)}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export default VideoShelfSection;
