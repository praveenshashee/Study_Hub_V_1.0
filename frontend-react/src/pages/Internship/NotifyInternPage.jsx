import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function NotifyInternPage() {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    company: "",
    companyEmail: "",
    internshipTitle: "",
    category: "IT",
    jobType: "Full time",
    location: "",
    deadline: "",
    description: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      setSubmitted(false);
      setErrorMessage("");

      await api.post("/api/internship-notifications", formData);

      setSubmitted(true);

      setFormData({
        studentName: "",
        studentEmail: "",
        company: "",
        companyEmail: "",
        internshipTitle: "",
        category: "IT",
        jobType: "Full time",
        location: "",
        deadline: "",
        description: "",
        notes: "",
      });
    } catch (err) {
      console.error("Failed to submit internship notification:", err);

      const backendMessage =
        err?.response?.data?.message ||
        "Failed to submit internship details.";

      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container notify-intern-page">
      <div className="page-header form-header">
        <h1>Notify Internship</h1>
        <p>Students can submit internship details for admin review</p>
      </div>

      <Link to="/internships" className="back-link">
        Back to Internships
      </Link>

      <form onSubmit={handleSubmit} className="video-form notify-intern-form">
        <label htmlFor="studentName">Student Name</label>
        <input
          type="text"
          id="studentName"
          placeholder="Enter your full name"
          value={formData.studentName}
          onChange={handleChange}
          required
        />

        <label htmlFor="studentEmail">Student Email</label>
        <input
          type="email"
          id="studentEmail"
          placeholder="Enter your email"
          value={formData.studentEmail}
          onChange={handleChange}
          required
        />

        <label htmlFor="company">Company Name</label>
        <input
          type="text"
          id="company"
          placeholder="Enter company name"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <label htmlFor="companyEmail">Company Email</label>
        <input
          type="email"
          id="companyEmail"
          placeholder="Enter company email"
          value={formData.companyEmail}
          onChange={handleChange}
          required
        />

        <label htmlFor="internshipTitle">Internship Title</label>
        <input
          type="text"
          id="internshipTitle"
          placeholder="Enter internship title"
          value={formData.internshipTitle}
          onChange={handleChange}
          required
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

        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          placeholder="Enter location"
          value={formData.location}
          onChange={handleChange}
        />

        <label htmlFor="deadline">Application Deadline</label>
        <input
          type="date"
          id="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />

        <label htmlFor="description">Internship Description</label>
        <textarea
          id="description"
          placeholder="Enter internship description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
        />

        <label htmlFor="notes">Extra Notes</label>
        <textarea
          id="notes"
          placeholder="Any extra notes for admin"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send to Admin"}
        </button>

        {submitted && (
          <p className="success-text notify-intern-feedback">
            Internship details submitted successfully.
          </p>
        )}

        {errorMessage && (
          <p className="error-text notify-intern-feedback">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}

export default NotifyInternPage;