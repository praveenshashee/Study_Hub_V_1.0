import { useEffect, useState } from "react";
import {
  clearRecentViews,
  PERSONALIZATION_EVENT,
  readPersonalizationState,
  toggleBookmarkedVideo
} from "../utils/personalization.js";

function usePersonalization() {
  const [state, setState] = useState(() => readPersonalizationState());

  useEffect(() => {
    const syncState = () => {
      setState(readPersonalizationState());
    };

    window.addEventListener("storage", syncState);
    window.addEventListener(PERSONALIZATION_EVENT, syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(PERSONALIZATION_EVENT, syncState);
    };
  }, []);

  const bookmarkIds = state.bookmarks.map((entry) => entry.id);
  const recentVideoIds = state.recentViews.map((entry) => entry.id);

  return {
    bookmarks: state.bookmarks,
    recentViews: state.recentViews,
    bookmarkIds,
    recentVideoIds,
    isBookmarked: (videoId) => bookmarkIds.includes(Number(videoId)),
    toggleBookmark: (videoId) => {
      const nextState = toggleBookmarkedVideo(videoId);
      setState(nextState);
    },
    clearRecentViews: () => {
      const nextState = clearRecentViews();
      setState(nextState);
    }
  };
}

export default usePersonalization;
