import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import CloudinaryUploadButton from "../components/CloudinaryUploadButton";

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    videoPublicId: "",
    labSheetUrl: "",
    modelPaperUrl: "",
    uploader: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/api/videos/${id}`);
      const video = response.data;

      setFormData({
        title: video.title || "",
        subject: video.subject || "",
        description: video.description || "",
        videoUrl: video.videoUrl || "",
        thumbnailUrl: video.thumbnailUrl || "",
        videoPublicId: video.videoPublicId || "",
        labSheetUrl: video.materials?.labSheet || "",
        modelPaperUrl: video.materials?.modelPaper || "",
        uploader: video.uploader || ""
      });
    } catch (err) {
      console.error("Failed to fetch video for editing:", err);
      setError("Failed to load video data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoUploadSuccess = (uploadedVideo) => {
    const generatedThumbnailUrl =
      `https://res.cloudinary.com/de9xr5nq4/video/upload/so_1/${uploadedVideo.public_id}.jpg`;

    setFormData((prev) => ({
      ...prev,
      videoUrl: uploadedVideo.secure_url,
      thumbnailUrl: generatedThumbnailUrl,
      videoPublicId: uploadedVideo.public_id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await api.put(`/api/videos/${id}`, formData);
      setSuccessMessage("Video updated successfully");

      setTimeout(() => {
        navigate(`/video/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to update video:", err);
      setError("Failed to update video");
    }
  };

  if (loading) {
    return <p className="page-message">Loading edit form...</p>;
  }

  if (error && !formData.title) {
    return <p className="page-message">{error}</p>;
  }

  return (
    <div className="form-page-container">
      <Link to={`/video/${id}`} className="back-link">← Back to Details</Link>

      <header className="page-header form-header">
        <h1>Edit Video</h1>
        <p>Update video details, replace the Cloudinary video, and manage optional study materials.</p>
      </header>

      <form onSubmit={handleSubmit} className="video-form">
        <label>Video Title</label>
        <input
          type="text"
          name="title"
          placeholder="Video Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Subject</label>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <div className="form-section">
          <h2>Video Management</h2>
          <p className="section-help">Replace the current video if needed. The thumbnail and Cloudinary asset data will update automatically.</p>

          <label>Replace Video</label>
          <CloudinaryUploadButton onUploadSuccess={handleVideoUploadSuccess} />

          <label>Video URL</label>
          <input
            type="text"
            name="videoUrl"
            placeholder="Video URL"
            value={formData.videoUrl}
            readOnly
            required
          />

          {formData.thumbnailUrl && (
            <img
              src={formData.thumbnailUrl}
              alt="Updated video thumbnail preview"
              className="thumbnail-preview"
            />
          )}
        </div>

        <div className="form-section">
          <h2>Study Materials</h2>
          <p className="section-help">Update optional Google Drive links for supporting documents.</p>

          <label>Lab Sheet URL (Optional)</label>
          <input
            type="url"
            name="labSheetUrl"
            placeholder="Paste Google Drive Lab Sheet link"
            value={formData.labSheetUrl}
            onChange={handleChange}
          />

          <label>Model Paper URL (Optional)</label>
          <input
            type="url"
            name="modelPaperUrl"
            placeholder="Paste Google Drive Model Paper link"
            value={formData.modelPaperUrl}
            onChange={handleChange}
          />
        </div>

        <label>Uploader Name</label>
        <input
          type="text"
          name="uploader"
          placeholder="Uploader Name"
          value={formData.uploader}
          onChange={handleChange}
          required
        />

        <button type="submit">Update Video</button>
      </form>

      {successMessage && <p className="success-text">{successMessage}</p>}
      {error && formData.title && <p className="error-text">{error}</p>}
    </div>
  );
}

export default EditVideo;