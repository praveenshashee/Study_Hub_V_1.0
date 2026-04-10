import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

function InternshipDetailsPage({ currentUser }) {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInternshipDetails();
  }, [id]);

  const fetchInternshipDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/internships/${id}`);
      setInternship(response.data || null);
    } catch (err) {
      console.error("Error fetching internship details:", err);
      const backendMessage =
        err?.response?.data?.message || "Could not load internship details.";
      setError(backendMessage);
      setInternship(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="details-page internship-details-page">
        <p className="page-message">Loading internship details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page internship-details-page">
        <Link to="/internships" className="back-link">
          Back to Internships
        </Link>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="details-page internship-details-page">
        <Link to="/internships" className="back-link">
          Back to Internships
        </Link>
        <p className="page-message">Internship not found.</p>
      </div>
    );
  }

  const internshipId = internship.id || internship._id;

  return (
    <div className="details-page internship-details-page">
      <Link to="/internships" className="back-link">
        Back to Internships
      </Link>

      <div className="details-card internship-details-card">
        <h1>{internship.title}</h1>

        <div className="internship-details-meta">
          <p><strong>Company:</strong> {internship.company}</p>
          <p><strong>Gmail:</strong> {internship.gmail || "Not provided"}</p>
          <p><strong>Category:</strong> {internship.category}</p>
          <p>
            <strong>Type:</strong>{" "}
            {internship.type || internship.jobType || internship.job_type || "Internship"}
          </p>
          <p><strong>Location:</strong> {internship.location || "Not specified"}</p>
          <p>
            <strong>Deadline:</strong>{" "}
            {internship.deadline
              ? new Date(internship.deadline).toLocaleDateString()
              : "Not specified"}
          </p>
        </div>

        <div className="internship-details-section">
          <h3>Description</h3>
          <p>{internship.description || "No description available."}</p>
        </div>

        {currentUser?.role === "admin" && (
          <div className="internship-details-actions">
            <Link
              to={`/internships/update/${internshipId}`}
              className="action-btn edit-btn"
            >
              Update Internship
            </Link>

            <Link
              to={`/internships/delete/${internshipId}`}
              className="action-btn delete-btn"
            >
              Delete Internship
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default InternshipDetailsPage;