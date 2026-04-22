import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import VideoDetails from "./pages/VideoDetails";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Navbar from "./components/Navbar";
import LandingNavbar from "./components/LandingNavbar";
import InternshipsHome from "./pages/Internship/InternshipsHome";
import AddInternshipPage from "./pages/Internship/AddInternshipPage";
import InternshipDetailsPage from "./pages/Internship/InternshipDetailsPage";
import UpdateInternshipPage from "./pages/Internship/UpdateInternshipPage";
import DeleteInternshipPage from "./pages/Internship/DeleteInternshipPage";
import NotifyInternPage from "./pages/Internship/NotifyInternPage";
import InternshipNotificationsPage from "./pages/Internship/InternshipNotificationsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import CommentAlerts from "./pages/CommentAlerts";
import api from "./services/api.js";
import EventsHome from "./pages/Events/EventsHome";
import AddEventPage from "./pages/Events/AddEventPage";
import UpdateEventPage from "./pages/Events/UpdateEventPage";
import DeleteEventPage from "./pages/Events/DeleteEventPage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("studyhub-theme") || "light";
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("studyhub-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const requestLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await api.post("/api/auth/logout");
      setCurrentUser(null);
      setLogoutModalOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Failed to log out");
    } finally {
      setLogoutLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isLandingPage = location.pathname === "/";

  return (
    <>
      {isLandingPage ? (
        <LandingNavbar
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={requestLogout}
        />
      ) : (
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={requestLogout}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={<LandingPage currentUser={currentUser} />}
        />
        <Route
          path="/home"
          element={<Home currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route
          path="/video/:id"
          element={<VideoDetails currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/edit/:id" element={<EditVideo />} />
        <Route path="/login" element={<Login refreshCurrentUser={fetchCurrentUser} />} />
        <Route path="/signup" element={<Signup refreshCurrentUser={fetchCurrentUser} />} />
        <Route
          path="/profile"
          element={<Profile currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route
          path="/comment-alerts"
          element={<CommentAlerts currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route
          path="/internships"
          element={<InternshipsHome currentUser={currentUser} />}
        />
        <Route path="/internships/add" element={<AddInternshipPage />} />
        <Route
          path="/internships/details/:id"
          element={<InternshipDetailsPage currentUser={currentUser} />}
        />
        <Route path="/internships/update/:id" element={<UpdateInternshipPage />} />
        <Route path="/internships/delete/:id" element={<DeleteInternshipPage />} />
        <Route path="/internships/notify" element={<NotifyInternPage />} />
        <Route path="/internships/notifications" element={<InternshipNotificationsPage />} />
        <Route
          path="/events"
          element={<EventsHome currentUser={currentUser} />}
        />
        <Route path="/events/add" element={<AddEventPage currentUser={currentUser} />} />
        <Route path="/events/update/:id" element={<UpdateEventPage currentUser={currentUser} />} />
        <Route path="/events/delete/:id" element={<DeleteEventPage currentUser={currentUser} />} />
      </Routes>

      {logoutModalOpen && (
        <div className="logout-modal-backdrop" role="presentation">
          <div className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
            <span className="logout-modal-mark">SH</span>
            <h2 id="logout-modal-title">Log out of Study Hub?</h2>
            <p>Your current session will end, and you can sign back in anytime.</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-secondary"
                onClick={() => setLogoutModalOpen(false)}
                disabled={logoutLoading}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                className="logout-modal-primary"
                onClick={confirmLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
