import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import EditPage from "./pages/EditPage.jsx";
import VideoDetailsPage from "./pages/VideoDetailsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import {
  createVideo,
  deleteVideo,
  fetchVideos,
  incrementVideoViews,
  updateVideo
} from "./lib/api.js";
import {
  getDashboardData,
  readPersonalizationState,
  removeVideoFromState,
  toggleBookmarkInState,
  trackWatchedVideo,
  writePersonalizationState
} from "./lib/personalization.js";

function sortById(videos) {
  return [...videos].sort((left, right) => left.id - right.id);
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [personalizationState, setPersonalizationState] = useState(() => readPersonalizationState());

  useEffect(() => {
    writePersonalizationState(personalizationState);
  }, [personalizationState]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialVideos() {
      try {
        setIsLoading(true);
        setLoadError("");
        const nextVideos = await fetchVideos();

        if (isActive) {
          setVideos(nextVideos);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || "Failed to load videos.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInitialVideos();

    return () => {
      isActive = false;
    };
  }, []);

  function toggleBookmark(videoId) {
    setPersonalizationState((currentState) => toggleBookmarkInState(currentState, videoId));
  }

  function markVideoAsWatched(video) {
    setPersonalizationState((currentState) => trackWatchedVideo(currentState, video));
  }

  async function handleCreateVideo(payload) {
    const response = await createVideo(payload);
    setVideos((currentVideos) => sortById([...currentVideos, response.video]));
    return response.video;
  }

  async function handleUpdateVideo(videoId, payload) {
    const response = await updateVideo(videoId, payload);
    setVideos((currentVideos) => (
      currentVideos.map((video) => (video.id === response.video.id ? response.video : video))
    ));
    return response.video;
  }

  async function handleDeleteVideo(videoId) {
    await deleteVideo(videoId);
    setVideos((currentVideos) => currentVideos.filter((video) => video.id !== Number(videoId)));
    setPersonalizationState((currentState) => removeVideoFromState(currentState, videoId));
  }

  async function handleIncrementViews(videoId) {
    const updatedVideo = await incrementVideoViews(videoId);
    setVideos((currentVideos) => (
      currentVideos.map((video) => (video.id === updatedVideo.id ? updatedVideo : video))
    ));
    return updatedVideo;
  }

  const appState = {
    videos,
    isLoading,
    loadError,
    personalizationState,
    dashboardData: getDashboardData(videos, personalizationState),
    isBookmarked(videoId) {
      return personalizationState.bookmarkedIds.includes(Number(videoId));
    },
    toggleBookmark,
    markVideoAsWatched,
    createVideo: handleCreateVideo,
    updateVideo: handleUpdateVideo,
    deleteVideo: handleDeleteVideo,
    incrementViews: handleIncrementViews
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout appState={appState} />}>
          <Route index element={<HomePage appState={appState} />} />
          <Route path="dashboard" element={<DashboardPage appState={appState} />} />
          <Route path="upload" element={<UploadPage appState={appState} />} />
          <Route path="videos/:videoId" element={<VideoDetailsPage appState={appState} />} />
          <Route path="videos/:videoId/edit" element={<EditPage appState={appState} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
