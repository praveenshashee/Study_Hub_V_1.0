import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function DeleteEventPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  // 🔒 protect page
  if (currentUser?.role !== "admin") {
    return <p className="error-text">Access Denied</p>;
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/events/${id}`);
      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Failed to delete event");
    }
  };

  return (
    <div className="home-container">
      <h1>Delete Event</h1>

      <p className="internship-delete-warning">
        Are you sure you want to delete this event?
      </p>

      <div className="internship-delete-actions">
        <button onClick={handleDelete} className="delete-btn">
          Yes, Delete
        </button>

        <Link to="/events" className="action-btn">
          Cancel
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default DeleteEventPage;