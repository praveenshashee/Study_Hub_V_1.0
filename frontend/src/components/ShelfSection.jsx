import VideoCard from "./VideoCard.jsx";

export default function ShelfSection({
  id,
  title,
  subtitle,
  videos,
  emptyMessage,
  isBookmarked,
  onToggleBookmark,
  progressById = {}
}) {
  return (
    <section id={id} className="section-stack">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Curated Shelf</p>
          <h2>{title}</h2>
        </div>
        <p>{subtitle}</p>
      </div>

      {videos.length > 0 ? (
        <div className="shelf-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              bookmarked={isBookmarked(video.id)}
              onToggleBookmark={onToggleBookmark}
              progress={progressById[video.id]}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
