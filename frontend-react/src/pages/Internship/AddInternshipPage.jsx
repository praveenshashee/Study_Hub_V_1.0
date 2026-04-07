import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddInternshipPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    gmail: "",
    location: "",
    category: "IT",
    jobType: "Full time",
    description: "",
    deadline: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      await api.post("/api/internships", payload);

      setSuccessMessage("Internship added successfully.");

      setTimeout(() => {
        navigate("/internships");
      }, 1200);
    } catch (err) {
      console.error("Add internship failed:", err);

      const backendMessage =
        err?.response?.data?.message || "An error occurred while adding the internship.";

      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="page-header form-header">
        <h1>Add Internship</h1>
        <p>Create a new internship opportunity</p>
      </div>

      <Link to="/internships" className="back-link">
        Back to Internships
      </Link>

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

        <label htmlFor="gmail">Gmail</label>
        <input
          type="email"
          id="gmail"
          placeholder="example@gmail.com"
          value={formData.gmail}
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
          {submitting ? "Adding..." : "Add Internship"}
        </button>

        {successMessage && <p className="success-text">{successMessage}</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </form>
    </div>
  );
}

export default AddInternshipPage;