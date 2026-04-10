import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function EventsHome({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/events");
      const data = Array.isArray(response.data) ? response.data : [];
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Events could not be loaded.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container events-home-container">
      <div className="page-header">
        <h1>Campus Events</h1>
        <p>Explore upcoming campus activities</p>
      </div>

      <div className="events-actions">
        {currentUser?.role === "admin" && (
          <Link to="/events/add" className="upload-link">
            + Add Event
          </Link>
        )}
      </div>

      {loading && <p className="page-message">Loading events...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="page-message">No events available.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => {
            const eventId = event.id || event._id;

            return (
              <div key={eventId} className="event-card">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                </div>

                <div className="event-card-body">
                  <p>
                    <strong>Organizer:</strong> {event.organizer || "Not specified"}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location || "Not specified"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Not specified"}
                  </p>
                  <p className="event-description">
                    {event.description || "No description available."}
                  </p>
                </div>

                {currentUser?.role === "admin" && (
                  <div className="event-admin-actions">
                    <Link
                      to={`/events/update/${eventId}`}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/events/delete/${eventId}`}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventsHome;