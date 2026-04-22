import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

function Profile({ currentUser, authLoading }) {
  const displayName = currentUser?.fullName || "Study Hub User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const accountDetails = [
    {
      label: "Full name",
      value: currentUser?.fullName || "Not available"
    },
    {
      label: "Email address",
      value: currentUser?.email || "Not available"
    },
    {
      label: "Account role",
      value: currentUser?.role || "Guest"
    },
    {
      label: "Profile image",
      value: currentUser?.profileImageUrl ? "Custom image connected" : "Initials avatar"
    }
  ];

  if (authLoading) {
    return (
      <main className="profile-page-shell">
        <section className="profile-loading-card">
          <div className="profile-loading-orbit"></div>
          <p>Preparing your profile...</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="profile-page-shell">
        <section className="profile-empty-card">
          <span className="profile-empty-mark">SH</span>
          <h1>Sign in to view your profile</h1>
          <p>
            Your Study Hub profile brings your account identity, access level,
            and learning shortcuts into one place.
          </p>
          <div className="profile-empty-actions">
            <Link to="/login" className="profile-primary-action">
              Login
            </Link>
            <Link to="/signup" className="profile-secondary-action">
              Create Account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page-shell">
      <section className="profile-hero-card">
        <div className="profile-hero-gradient"></div>

        <div className="profile-hero-content">
          <div className="profile-avatar-wrap">
            <UserAvatar currentUser={currentUser} className="profile-page-avatar" />
            <span className="profile-status-dot" aria-label="Account active"></span>
          </div>

          <div className="profile-hero-copy">
            <span className="profile-kicker">My Profile</span>
            <h1>{displayName}</h1>
            <p>{currentUser.email}</p>
            <div className="profile-pill-row">
              <span>{currentUser.role}</span>
              <span>ID #{currentUser.id}</span>
              <span>{initials || "SH"}</span>
            </div>
          </div>

          <div className="profile-action-panel">
            <Link to="/home" className="profile-primary-action">
              Open Library
            </Link>
            {currentUser.role === "admin" ? (
              <Link to="/upload" className="profile-secondary-action">
                Upload Video
              </Link>
            ) : (
              <Link to="/internships" className="profile-secondary-action">
                Browse Internships
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="profile-content-grid">
        <div className="profile-details-card">
          <div className="profile-section-heading">
            <span>Account</span>
            <h2>Personal details</h2>
          </div>

          <div className="profile-detail-list">
            {accountDetails.map((detail) => (
              <div className="profile-detail-item" key={detail.label}>
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-insight-card">
          <div className="profile-section-heading">
            <span>Access</span>
            <h2>Study Hub role</h2>
          </div>

          <div className={`profile-role-badge profile-role-${currentUser.role}`}>
            {currentUser.role}
          </div>

          <p>
            {currentUser.role === "admin"
              ? "You can manage learning content, update materials, and keep the platform fresh for everyone."
              : "You can explore videos, review resources, and follow internships and events across the platform."}
          </p>

          <div className="profile-mini-stats">
            <div>
              <strong>Active</strong>
              <span>Session status</span>
            </div>
            <div>
              <strong>{currentUser.role === "admin" ? "Editor" : "Learner"}</strong>
              <span>Workspace mode</span>
            </div>
          </div>
        </div>

        <div className="profile-shortcuts-card">
          <div className="profile-section-heading">
            <span>Shortcuts</span>
            <h2>Jump back in</h2>
          </div>

          <div className="profile-shortcut-list">
            <Link to="/home">
              <span>Video library</span>
              <strong>Explore study materials</strong>
            </Link>
            <Link to="/events">
              <span>Events</span>
              <strong>See academic events</strong>
            </Link>
            <Link to="/internships">
              <span>Internships</span>
              <strong>Find opportunities</strong>
            </Link>
            {currentUser.role === "admin" && (
              <Link to="/upload">
                <span>Admin tools</span>
                <strong>Publish a new video</strong>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
