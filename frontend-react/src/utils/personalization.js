const PERSONALIZATION_STORAGE_KEY = "studyhub-personalization";
export const PERSONALIZATION_EVENT = "studyhub-personalization-updated";

const MAX_RECENT_VIEWS = 8;
const MAX_BOOKMARKS = 24;

const defaultState = {
  bookmarks: [],
  recentViews: []
};

const isBrowser = () => typeof window !== "undefined";

const normalizeEntries = (entries, timestampKey, limit) => {
  if (!Array.isArray(entries)) {
    return [];
  }

  const seenIds = new Set();

  return entries
    .map((entry) => {
      const id = Number(entry?.id);
      const timestamp = Number(entry?.[timestampKey]) || Date.now();

      if (!Number.isFinite(id)) {
        return null;
      }

      return {
        id,
        [timestampKey]: timestamp
      };
    })
    .filter(Boolean)
    .sort((left, right) => right[timestampKey] - left[timestampKey])
    .filter((entry) => {
      if (seenIds.has(entry.id)) {
        return false;
      }

      seenIds.add(entry.id);
      return true;
    })
    .slice(0, limit);
};

const normalizeState = (state) => ({
  bookmarks: normalizeEntries(state?.bookmarks, "savedAt", MAX_BOOKMARKS),
  recentViews: normalizeEntries(state?.recentViews, "viewedAt", MAX_RECENT_VIEWS)
});

export const readPersonalizationState = () => {
  if (!isBrowser()) {
    return defaultState;
  }

  try {
    const rawValue = window.localStorage.getItem(PERSONALIZATION_STORAGE_KEY);

    if (!rawValue) {
      return defaultState;
    }

    return normalizeState(JSON.parse(rawValue));
  } catch (error) {
    console.error("Failed to read personalization state:", error);
    return defaultState;
  }
};

const writePersonalizationState = (state) => {
  const nextState = normalizeState(state);

  if (!isBrowser()) {
    return nextState;
  }

  window.localStorage.setItem(
    PERSONALIZATION_STORAGE_KEY,
    JSON.stringify(nextState)
  );

  window.dispatchEvent(new Event(PERSONALIZATION_EVENT));

  return nextState;
};

export const toggleBookmarkedVideo = (videoId) => {
  const normalizedId = Number(videoId);

  if (!Number.isFinite(normalizedId)) {
    return readPersonalizationState();
  }

  const currentState = readPersonalizationState();
  const isBookmarked = currentState.bookmarks.some(
    (entry) => entry.id === normalizedId
  );

  const bookmarks = isBookmarked
    ? currentState.bookmarks.filter((entry) => entry.id !== normalizedId)
    : [
        {
          id: normalizedId,
          savedAt: Date.now()
        },
        ...currentState.bookmarks
      ];

  return writePersonalizationState({
    ...currentState,
    bookmarks
  });
};

export const recordRecentlyViewedVideo = (videoId) => {
  const normalizedId = Number(videoId);

  if (!Number.isFinite(normalizedId)) {
    return readPersonalizationState();
  }

  const currentState = readPersonalizationState();
  const recentViews = [
    {
      id: normalizedId,
      viewedAt: Date.now()
    },
    ...currentState.recentViews.filter((entry) => entry.id !== normalizedId)
  ];

  return writePersonalizationState({
    ...currentState,
    recentViews
  });
};

export const clearRecentViews = () =>
  writePersonalizationState({
    ...readPersonalizationState(),
    recentViews: []
  });
