import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VideoDetails from "./pages/VideoDetails";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/edit/:id" element={<EditVideo />} />
      </Routes>
    </div>
  );
}

export default App;