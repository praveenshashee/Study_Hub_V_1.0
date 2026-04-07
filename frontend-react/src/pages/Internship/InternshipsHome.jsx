import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function InternshipsHome() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/internships");
      const data = Array.isArray(response.data) ? response.data : [];
      setInternships(data);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Internships could not be loaded yet.");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInternships = useMemo(() => {
    return internships.filter((intern) => {
      const title = intern?.title || "";
      const company = intern?.company || "";
      const gmail = intern?.gmail || "";
      const internCategory = intern?.category || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        title.toLowerCase().includes(searchText) ||
        company.toLowerCase().includes(searchText) ||
        gmail.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "" || internCategory === category;

      return matchesSearch && matchesCategory;
    });
  }, [internships, search, category]);

  return (
    <div className="home-container internships-home-container">
      <div className="page-header">
        <h1>Internship Opportunities</h1>
        <p>Find your next career opportunity</p>
      </div>

      <div className="controls internships-controls">
        <input
          type="text"
          className="search-input internships-search-input"
          placeholder="Search internships..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="sort-select internships-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="Business">Business</option>
          <option value="Engineering">Engineering</option>
          <option value="Bio tech">Bio tech</option>
        </select>

        <div className="internships-action-links">
          <div className="internships-action-links">
            <Link to="/internships/add" className="upload-link internships-add-link">
              + Add Internship
            </Link>

            <Link to="/internships/notify" className="upload-link internships-notify-link">
              Notify Intern
            </Link>

            <Link
              to="/internships/notifications"
              className="upload-link internships-notification-link"
            >
              Intern Notification
            </Link>
          </div>
        </div>
      </div>

      {loading && <p className="page-message">Loading internships...</p>}

      {!loading && error && <p className="error-text internships-feedback">{error}</p>}

      {!loading && !error && filteredInternships.length === 0 && (
        <p className="page-message">No internships found.</p>
      )}

      {!loading && !error && filteredInternships.length > 0 && (
        <div className="internships-list">
          {filteredInternships.map((intern) => {
            const internshipId = intern.id || intern._id;

            return (
              <div key={internshipId} className="internship-card">
                <h3>{intern.title}</h3>
                <p><strong>Company:</strong> {intern.company}</p>
                <p><strong>Gmail:</strong> {intern.gmail || "Not provided"}</p>
                <p><strong>Category:</strong> {intern.category}</p>
                <p><strong>Type:</strong> {intern.type || intern.job_type || "Internship"}</p>
                <p><strong>Location:</strong> {intern.location || "Not specified"}</p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {intern.deadline
                    ? new Date(intern.deadline).toLocaleDateString()
                    : "Not specified"}
                </p>

                <Link
                  to={`/internships/details/${internshipId}`}
                  className="material-link internship-view-link"
                >
                  View Details
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InternshipsHome;