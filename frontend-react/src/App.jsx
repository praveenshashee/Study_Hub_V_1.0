import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import VideoDetails from "./pages/VideoDetails";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Navbar from "./components/Navbar";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("studyhub-theme") || "light";
  });

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem("studyhub-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/edit/:id" element={<EditVideo />} />
      </Routes>
    </>
  );
}

export default App;