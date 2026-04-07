import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import VideoDetails from "./pages/VideoDetails";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Navbar from "./components/Navbar";
import InternshipsHome from "./pages/Internship/InternshipsHome";
import AddInternshipPage from "./pages/Internship/AddInternshipPage";
import InternshipDetailsPage from "./pages/Internship/InternshipDetailsPage";
import UpdateInternshipPage from "./pages/Internship/UpdateInternshipPage";
import DeleteInternshipPage from "./pages/Internship/DeleteInternshipPage";
import NotifyInternPage from "./pages/Internship/NotifyInternPage";
import InternshipNotificationsPage from "./pages/Internship/InternshipNotificationsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import api from "./services/api.js";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("studyhub-theme") || "light";
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Failed to log out");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={<Home currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route
          path="/video/:id"
          element={<VideoDetails currentUser={currentUser} authLoading={authLoading} />}
        />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/edit/:id" element={<EditVideo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/internships"
          element={<InternshipsHome currentUser={currentUser} />}
        />
        <Route path="/internships/add" element={<AddInternshipPage />} />
        <Route path="/internships/details/:id" element={<InternshipDetailsPage />} />
        <Route path="/internships/update/:id" element={<UpdateInternshipPage />} />
        <Route path="/internships/delete/:id" element={<DeleteInternshipPage />} />
        <Route path="/internships/notify" element={<NotifyInternPage />} />
        <Route path="/internships/notifications" element={<InternshipNotificationsPage />} />
      </Routes>
    </>
  );
}

export default App;