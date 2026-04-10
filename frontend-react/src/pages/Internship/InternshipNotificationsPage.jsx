import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function InternshipNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/internship-notifications");
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch internship notifications:", err);

      const backendMessage =
        err?.response?.data?.message ||
        "Failed to load internship notifications.";

      setError(backendMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionMessage("");
      await api.post(`/api/internship-notifications/${id}/approve`);
      setActionMessage("Notification approved and added to internships.");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to approve internship notification:", err);

      const backendMessage =
        err?.response?.data?.message ||
        "Failed to approve internship notification.";

      setActionMessage(backendMessage);
    }
  };

  return (
    <div className="home-container internship-notifications-page">
      <div className="page-header">
        <h1>Intern Notifications</h1>
        <p>Student-submitted internship forms for admin review</p>
      </div>

      <Link to="/internships" className="back-link">
        Back to Internships
      </Link>

      {actionMessage && <p className="page-message">{actionMessage}</p>}
      {loading && <p className="page-message">Loading notifications...</p>}
      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="page-message">No internship notifications found.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="internship-notifications-table-wrapper">
          <table className="internship-notifications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Student Email</th>
                <th>Company</th>
                <th>Company Email</th>
                <th>Internship Title</th>
                <th>Category</th>
                <th>Job Type</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.student_name}</td>
                  <td>{item.student_email}</td>
                  <td>{item.company}</td>
                  <td>{item.company_email}</td>
                  <td>{item.internship_title}</td>
                  <td>{item.category || "—"}</td>
                  <td>{item.employment_type || "—"}</td>
                  <td>{item.location || "—"}</td>
                  <td>
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{item.status || "pending"}</td>
                  <td>
                    {item.status !== "approved" ? (
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => handleApprove(item.id)}
                      >
                        Approve
                      </button>
                    ) : (
                      <span>Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InternshipNotificationsPage;