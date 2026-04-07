import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import CloudinaryUploadButton from "../components/CloudinaryUploadButton";
import { buildCloudinaryThumbnailUrl } from "../utils/cloudinary.js";

function UploadVideo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    videoUrl: "",
    videoPublicId: "",
    thumbnailUrl: "",
    labSheetUrl: "",
    modelPaperUrl: "",
    uploader: ""
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoUploadSuccess = (uploadedVideo) => {
    const generatedThumbnailUrl = buildCloudinaryThumbnailUrl(
      uploadedVideo.public_id
    );

    setFormData((prev) => ({
      ...prev,
      videoUrl: uploadedVideo.secure_url,
      videoPublicId: uploadedVideo.public_id,
      thumbnailUrl: generatedThumbnailUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await api.post("/api/videos", formData);
      setSuccessMessage("Video uploaded successfully");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Failed to upload video:", err);
      setError("Failed to upload video");
    }
  };

  return (
    <div className="form-page-container">
      <Link to="/" className="back-link">← Back to Home</Link>

      <header className="page-header form-header">
        <h1>Upload New Video</h1>
        <p>Add a new academic video, connect Cloudinary media, and attach optional study materials.</p>
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
          <h2>Video Upload</h2>
          <p className="section-help">Upload the main video through Cloudinary. The video link and preview thumbnail will be generated automatically.</p>

          <label>Upload Video</label>
          <CloudinaryUploadButton onUploadSuccess={handleVideoUploadSuccess} />
          <p className="section-help">
            Set <code>VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
            <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> in{" "}
            <code>frontend-react/.env</code> to enable uploads.
          </p>

          <label>Video URL</label>
          <input
            type="text"
            name="videoUrl"
            placeholder="Video will appear here after upload"
            value={formData.videoUrl}
            readOnly
            required
          />

          {formData.videoUrl && (
            <p className="success-text">Video uploaded to Cloudinary successfully</p>
          )}

          {formData.thumbnailUrl && (
            <img
              src={formData.thumbnailUrl}
              alt="Video thumbnail preview"
              className="thumbnail-preview"
            />
          )}
        </div>

        <div className="form-section">
          <h2>Study Materials</h2>
          <p className="section-help">Attach optional Google Drive links for supporting documents.</p>

          <label>Lab Sheet URL (Optional)</label>
          <input
            type="url"
            name="labSheetUrl"
            placeholder="Paste Google Drive Lab Sheet link (optional)"
            value={formData.labSheetUrl}
            onChange={handleChange}
          />

          <label>Model Paper URL (Optional)</label>
          <input
            type="url"
            name="modelPaperUrl"
            placeholder="Paste Google Drive Model Paper link (optional)"
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

        <button type="submit">Upload Video</button>
      </form>

      {successMessage && <p className="success-text">{successMessage}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default UploadVideo;
