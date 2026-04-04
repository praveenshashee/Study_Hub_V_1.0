import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function UpdateInternshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    category: "IT",
    jobType: "Full time",
    description: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(`/api/internships/${id}`);
      const internship = response.data || {};

      setFormData({
        title: internship.title || "",
        company: internship.company || "",
        location: internship.location || "",
        category: internship.category || "IT",
        jobType: internship.type || internship.jobType || "Full time",
        description: internship.description || "",
        deadline: internship.deadline
          ? new Date(internship.deadline).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      console.error("Error loading internship:", err);
      const backendMessage =
        err?.response?.data?.message || "Could not load internship for editing.";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const payload = {
        ...formData,
        type: formData.jobType,
      };

      await api.put(`/api/internships/${id}`, payload);

      setSuccessMessage("Internship updated successfully.");

      setTimeout(() => {
        navigate(`/internships/details/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Update internship failed:", err);
      const backendMessage =
        err?.response?.data?.message || "An error occurred while updating the internship.";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container">
        <p className="page-message">Loading internship for editing...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="page-header form-header">
        <h1>Update Internship</h1>
        <p>Edit the selected internship opportunity</p>
      </div>

      <Link to={`/internships/details/${id}`} className="back-link">
        Back to Details
      </Link>

      {errorMessage && !submitting && !successMessage && (
        <p className="error-text internship-update-feedback">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="video-form internship-form">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          className="internship-form-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="IT">IT</option>
          <option value="Business">Business</option>
          <option value="Engineering">Engineering</option>
          <option value="Bio tech">Bio tech</option>
        </select>

        <label htmlFor="jobType">Job Type</label>
        <select
          id="jobType"
          className="internship-form-select"
          value={formData.jobType}
          onChange={handleChange}
        >
          <option value="Full time">Full time</option>
          <option value="Part time">Part time</option>
          <option value="Remote">Remote</option>
        </select>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <label htmlFor="deadline">Deadline</label>
        <input
          type="date"
          id="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update Internship"}
        </button>

        {successMessage && <p className="success-text">{successMessage}</p>}
        {submitting && !successMessage && !errorMessage && (
          <p className="page-message">Saving changes...</p>
        )}
      </form>
    </div>
  );
}

export default UpdateInternshipPage;