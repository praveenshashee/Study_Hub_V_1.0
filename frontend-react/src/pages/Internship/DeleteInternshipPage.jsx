import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function DeleteInternshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await api.delete(`/api/internships/${id}`);

      setTimeout(() => {
        navigate("/internships");
      }, 800);
    } catch (err) {
      console.error("Delete failed:", err);

      const backendMessage =
        err?.response?.data?.message || "Failed to delete internship.";

      setError(backendMessage);
      setDeleting(false);
    }
  };

  return (
    <div className="form-page-container internship-delete-page">
      <div className="page-header form-header">
        <h1>Delete Internship</h1>
        <p>Are you sure you want to delete this internship?</p>
      </div>

      <Link to={`/internships/details/${id}`} className="back-link">
        Cancel and go back
      </Link>

      <div className="internship-delete-box">
        <p className="internship-delete-warning">
          This action cannot be undone.
        </p>

        <div className="internship-delete-actions">
          <button
            onClick={handleDelete}
            className="action-btn delete-btn"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Confirm Delete"}
          </button>

          <Link
            to={`/internships/details/${id}`}
            className="action-btn edit-btn"
          >
            Cancel
          </Link>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default DeleteInternshipPage;