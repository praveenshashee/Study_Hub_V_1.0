const toNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getDaysSinceCreated = (createdAt) => {
  if (!createdAt) {
    return 365;
  }

  const timestamp = new Date(createdAt).getTime();

  if (Number.isNaN(timestamp)) {
    return 365;
  }

  return Math.max(0, (Date.now() - timestamp) / (1000 * 60 * 60 * 24));
};

const createVideoMap = (videos) =>
  new Map(videos.map((video) => [Number(video.id), video]));

const appendUniqueVideos = (baseVideos, fallbackVideos, limit) => {
  const selectedIds = new Set(baseVideos.map((video) => video.id));
  const result = [...baseVideos];

  for (const video of fallbackVideos) {
    if (selectedIds.has(video.id)) {
      continue;
    }

    result.push(video);
    selectedIds.add(video.id);

    if (result.length >= limit) {
      break;
    }
  }

  return result.slice(0, limit);
};

export const getPopularVideos = (videos, limit = 4) =>
  [...videos]
    .sort((left, right) => {
      const viewsDelta = toNumber(right.views) - toNumber(left.views);

      if (viewsDelta !== 0) {
        return viewsDelta;
      }

      const ratingDelta = toNumber(right.rating) - toNumber(left.rating);

      if (ratingDelta !== 0) {
        return ratingDelta;
      }

      return getDaysSinceCreated(left.createdAt) - getDaysSinceCreated(right.createdAt);
    })
    .slice(0, limit);

export const getPreferredSubject = ({ videos, bookmarks, recentViews }) => {
  const videosById = createVideoMap(videos);
  const subjectWeights = new Map();

  recentViews.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      subjectWeights.set(
        video.subject,
        (subjectWeights.get(video.subject) || 0) + 3
      );
    }
  });

  bookmarks.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      subjectWeights.set(
        video.subject,
        (subjectWeights.get(video.subject) || 0) + 2
      );
    }
  });

  const rankedSubjects = [...subjectWeights.entries()].sort(
    (left, right) => right[1] - left[1]
  );

  return rankedSubjects[0]?.[0] || "Still learning your preferences";
};

export const getRecommendedVideos = ({
  videos,
  bookmarks,
  recentViews,
  limit = 4
}) => {
  if (videos.length === 0) {
    return [];
  }

  const videosById = createVideoMap(videos);
  const preferredSubjects = new Map();

  recentViews.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      preferredSubjects.set(
        video.subject,
        (preferredSubjects.get(video.subject) || 0) + 4
      );
    }
  });

  bookmarks.forEach((entry) => {
    const video = videosById.get(entry.id);

    if (video?.subject) {
      preferredSubjects.set(
        video.subject,
        (preferredSubjects.get(video.subject) || 0) + 2
      );
    }
  });

  const touchedVideoIds = new Set([
    ...bookmarks.map((entry) => entry.id),
    ...recentViews.map((entry) => entry.id)
  ]);

  const scoredVideos = videos
    .map((video) => {
      const subjectScore = preferredSubjects.get(video.subject) || 0;
      const viewsScore = toNumber(video.views);
      const ratingScore = toNumber(video.rating);
      const freshnessScore = Math.max(0, 30 - getDaysSinceCreated(video.createdAt));
      const untouchedBonus = touchedVideoIds.has(Number(video.id)) ? -30 : 8;

      return {
        video,
        score:
          subjectScore * 100 +
          viewsScore +
          ratingScore * 18 +
          freshnessScore +
          untouchedBonus
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.video);

  const recommendedVideos = preferredSubjects.size
    ? scoredVideos.filter((video) => !touchedVideoIds.has(Number(video.id)))
    : [];

  return appendUniqueVideos(
    recommendedVideos,
    getPopularVideos(videos, limit),
    limit
  );
};
