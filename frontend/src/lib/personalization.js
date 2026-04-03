const STORAGE_KEY = "studyHubPersonalization";
const MAX_RECENT_ITEMS = 8;
const DEMO_STATE = {
  bookmarkedIds: [3, 5, 8],
  recentlyWatched: [
    { id: 4, watchedAt: new Date("2026-03-29T09:15:00Z").getTime(), progress: 76 },
    { id: 3, watchedAt: new Date("2026-03-28T16:40:00Z").getTime(), progress: 58 },
    { id: 8, watchedAt: new Date("2026-03-28T10:05:00Z").getTime(), progress: 34 },
    { id: 1, watchedAt: new Date("2026-03-27T13:30:00Z").getTime(), progress: 92 }
  ]
};

function normalizeRecentEntry(entry) {
  return {
    id: Number(entry?.id),
    watchedAt: Number(entry?.watchedAt) || Date.now(),
    progress: Math.min(Math.max(Number(entry?.progress) || 18, 5), 100)
  };
}

function normalizeState(state) {
  const bookmarkedIds = Array.isArray(state?.bookmarkedIds)
    ? [...new Set(state.bookmarkedIds.map(Number).filter(Number.isInteger))]
    : [];

  const recentlyWatched = Array.isArray(state?.recentlyWatched)
    ? state.recentlyWatched
        .map(normalizeRecentEntry)
        .filter((entry) => Number.isInteger(entry.id))
        .filter((entry, index, entries) => (
          entries.findIndex((candidate) => candidate.id === entry.id) === index
        ))
        .slice(0, MAX_RECENT_ITEMS)
    : [];

  return {
    bookmarkedIds,
    recentlyWatched
  };
}

export function writePersonalizationState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  } catch {
    // Ignore storage failures and keep the app usable in restricted browsers.
  }
}

export function readPersonalizationState() {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      const demoState = normalizeState(DEMO_STATE);
      writePersonalizationState(demoState);
      return demoState;
    }

    return normalizeState(JSON.parse(rawState));
  } catch {
    const demoState = normalizeState(DEMO_STATE);
    writePersonalizationState(demoState);
    return demoState;
  }
}

export function toggleBookmarkInState(state, videoId) {
  const normalizedState = normalizeState(state);
  const numericId = Number(videoId);
  const bookmarkedIds = new Set(normalizedState.bookmarkedIds);

  if (bookmarkedIds.has(numericId)) {
    bookmarkedIds.delete(numericId);
  } else {
    bookmarkedIds.add(numericId);
  }

  return {
    ...normalizedState,
    bookmarkedIds: [...bookmarkedIds]
  };
}

export function trackWatchedVideo(state, video) {
  const normalizedState = normalizeState(state);
  const numericId = Number(video?.id);

  if (!Number.isInteger(numericId)) {
    return normalizedState;
  }

  const existingEntry = normalizedState.recentlyWatched.find((entry) => entry.id === numericId);
  const nextProgress = existingEntry
    ? Math.min(existingEntry.progress + 14, 100)
    : 24 + (numericId % 5) * 9;

  return {
    ...normalizedState,
    recentlyWatched: [
      {
        id: numericId,
        watchedAt: Date.now(),
        progress: nextProgress
      },
      ...normalizedState.recentlyWatched.filter((entry) => entry.id !== numericId)
    ].slice(0, MAX_RECENT_ITEMS)
  };
}

export function removeVideoFromState(state, videoId) {
  const normalizedState = normalizeState(state);
  const numericId = Number(videoId);

  return {
    bookmarkedIds: normalizedState.bookmarkedIds.filter((id) => id !== numericId),
    recentlyWatched: normalizedState.recentlyWatched.filter((entry) => entry.id !== numericId)
  };
}

function buildSubjectWeights(recentlyWatched, bookmarkedVideos) {
  const subjectWeights = new Map();

  recentlyWatched.forEach((video, index) => {
    if (!video?.subject) {
      return;
    }

    const weight = Math.max(5 - index, 1) + Math.round((video.progress || 0) / 25);
    subjectWeights.set(video.subject, (subjectWeights.get(video.subject) || 0) + weight);
  });

  bookmarkedVideos.forEach((video) => {
    if (!video?.subject) {
      return;
    }

    subjectWeights.set(video.subject, (subjectWeights.get(video.subject) || 0) + 3);
  });

  return subjectWeights;
}

export function getDashboardData(allVideos, state) {
  const normalizedState = normalizeState(state);
  const videosById = new Map(allVideos.map((video) => [video.id, video]));

  const bookmarkedVideos = normalizedState.bookmarkedIds
    .map((id) => videosById.get(id))
    .filter(Boolean);

  const recentlyWatched = normalizedState.recentlyWatched
    .map((entry) => {
      const video = videosById.get(entry.id);

      if (!video) {
        return null;
      }

      return {
        ...video,
        watchedAt: entry.watchedAt,
        progress: entry.progress
      };
    })
    .filter(Boolean);

  const subjectWeights = buildSubjectWeights(recentlyWatched, bookmarkedVideos);
  const bookmarkedIds = new Set(normalizedState.bookmarkedIds);

  const recommended = [...allVideos]
    .filter((video) => !bookmarkedIds.has(video.id))
    .map((video) => ({
      video,
      score:
        (subjectWeights.get(video.subject) || 0) * 100 +
        video.rating * 10 +
        video.views
    }))
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.video)
    .slice(0, 8);

  const popular = [...allVideos]
    .sort((left, right) => {
      if (right.views !== left.views) {
        return right.views - left.views;
      }

      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return new Date(right.createdAt) - new Date(left.createdAt);
    })
    .slice(0, 8);

  const favoriteSubjects = [...subjectWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([subject]) => subject)
    .slice(0, 3);

  return {
    bookmarkedVideos,
    recentlyWatched,
    recommended,
    popular,
    favoriteSubjects,
    heroVideo: recentlyWatched[0] || recommended[0] || popular[0] || allVideos[0] || null,
    stats: {
      watchedCount: recentlyWatched.length,
      savedCount: bookmarkedVideos.length,
      recommendationCount: recommended.length,
      popularCount: popular.length
    }
  };
}
