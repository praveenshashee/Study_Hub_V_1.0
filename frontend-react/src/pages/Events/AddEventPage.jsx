import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddEventPage({ currentUser }) {
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/events", formData);
      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Failed to create event");
    }
  };

  return (
    <div className="form-page-container">
      <h1>Add Event</h1>

      <Link to="/events">Back</Link>

      <form onSubmit={handleSubmit} className="video-form">
        <input id="title" placeholder="Title" onChange={handleChange} required />
        <input id="organizer" placeholder="Organizer" onChange={handleChange} required />
        <input id="location" placeholder="Location" onChange={handleChange} />
        <input type="date" id="date" onChange={handleChange} />
        <textarea id="description" placeholder="Description" onChange={handleChange} />

        <button type="submit">Add Event</button>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

export default AddEventPage;