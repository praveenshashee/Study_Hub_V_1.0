import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function UpdateEventPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    location: "",
    date: "",
    description: ""
  });

  const [error, setError] = useState("");

  // 🔒 protect page
  if (currentUser?.role !== "admin") {
    return <p className="error-text">Access Denied</p>;
  }

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/api/events/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load event");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/events/${id}`, formData);
      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Failed to update event");
    }
  };

  return (
    <div className="form-page-container">
      <h1>Update Event</h1>

      <Link to="/events">Back</Link>

      <form onSubmit={handleSubmit} className="video-form">
        <input id="title" value={formData.title} onChange={handleChange} required />
        <input id="organizer" value={formData.organizer} onChange={handleChange} required />
        <input id="location" value={formData.location} onChange={handleChange} />
        <input type="date" id="date" value={formData.date || ""} onChange={handleChange} />
        <textarea id="description" value={formData.description} onChange={handleChange} />

        <button type="submit">Update Event</button>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

export default UpdateEventPage;