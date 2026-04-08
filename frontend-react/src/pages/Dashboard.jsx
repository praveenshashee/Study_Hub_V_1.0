import { useEffect, useState } from "react";
import api from "../services/api.js";
import usePersonalization from "../hooks/usePersonalization.js";
import { getPopularVideos } from "../utils/recommendations.js";
import { getLatestVideo, getUpcomingInternships } from "../utils/dashboardInsights.js";
import GuestDashboardView from "../components/dashboard/GuestDashboardView.jsx";
import AdminDashboardView from "../components/dashboard/AdminDashboardView.jsx";
import UserDashboardView from "../components/dashboard/UserDashboardView.jsx";

function Dashboard({ currentUser, authLoading }) {
  const [videos, setVideos] = useState([]);
  const [internships, setInternships] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    bookmarks,
    recentViews,
    isBookmarked,
    toggleBookmark,
    clearRecentViews
  } = usePersonalization();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      const requests = [
        api.get("/api/videos"),
        api.get("/api/internships")
      ];

      if (currentUser?.role === "admin") {
        requests.push(api.get("/api/internship-notifications"));
      }

      const results = await Promise.allSettled(requests);
      const failedSections = [];

      const videosResult = results[0];
      const internshipsResult = results[1];
      const notificationsResult = results[2];

      if (videosResult.status === "fulfilled") {
        setVideos(Array.isArray(videosResult.value.data) ? videosResult.value.data : []);
      } else {
        console.error("Failed to load dashboard videos:", videosResult.reason);
        setVideos([]);
        failedSections.push("videos");
      }

      if (internshipsResult.status === "fulfilled") {
        setInternships(
          Array.isArray(internshipsResult.value.data)
            ? internshipsResult.value.data
            : []
        );
      } else {
        console.error(
          "Failed to load dashboard internships:",
          internshipsResult.reason
        );
        setInternships([]);
        failedSections.push("internships");
      }

      if (currentUser?.role === "admin") {
        if (notificationsResult?.status === "fulfilled") {
          setNotifications(
            Array.isArray(notificationsResult.value.data)
              ? notificationsResult.value.data
              : []
          );
        } else {
          console.error(
            "Failed to load dashboard notifications:",
            notificationsResult?.reason
          );
          setNotifications([]);
          failedSections.push("notifications");
        }
      } else {
        setNotifications([]);
      }

      if (failedSections.length >= 3 || failedSections.length === 2) {
        setError("Some dashboard sections could not be loaded right now.");
      } else if (failedSections.length === 1) {
        setError(`The ${failedSections[0]} section could not be loaded right now.`);
      }

      setLoading(false);
    };

    loadDashboardData();
  }, [authLoading, currentUser?.role]);

  if (authLoading || loading) {
    return (
      <div className="dashboard-page">
        <p className="page-message">Loading dashboard...</p>
      </div>
    );
  }

  const latestVideo = getLatestVideo(videos);
  const upcomingInternships = getUpcomingInternships(internships, 3);
  const popularVideos = getPopularVideos(videos, 4);

  if (!currentUser) {
    return (
      <GuestDashboardView
        videos={videos}
        internships={internships}
        latestVideo={latestVideo}
        upcomingInternships={upcomingInternships}
        popularVideos={popularVideos}
      />
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AdminDashboardView
        currentUser={currentUser}
        videos={videos}
        internships={internships}
        notifications={notifications}
        error={error}
        latestVideo={latestVideo}
        upcomingInternships={upcomingInternships}
        popularVideos={popularVideos}
      />
    );
  }

  return (
    <UserDashboardView
      currentUser={currentUser}
      videos={videos}
      internships={internships}
      error={error}
      bookmarks={bookmarks}
      recentViews={recentViews}
      isBookmarked={isBookmarked}
      toggleBookmark={toggleBookmark}
      clearRecentViews={clearRecentViews}
    />
  );
}

export default Dashboard;
