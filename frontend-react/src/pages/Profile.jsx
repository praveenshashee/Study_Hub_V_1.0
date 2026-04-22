import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CloudinaryUploadButton from "../components/CloudinaryUploadButton";
import UserAvatar from "../components/UserAvatar";

function Profile({ currentUser, authLoading, refreshCurrentUser, onSessionEnded }) {
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    profileImageUrl: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileUploadMessage, setProfileUploadMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);

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

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setProfileForm({
      fullName: currentUser.fullName || "",
      profileImageUrl: currentUser.profileImageUrl || ""
    });
  }, [currentUser]);

  const handleProfileChange = (event) => {
    setProfileForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handlePasswordChange = (event) => {
    setPasswordForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleProfileImageUploadSuccess = (uploadedImage) => {
    setProfileForm((prev) => ({
      ...prev,
      profileImageUrl: uploadedImage.secure_url || ""
    }));
    setProfileUploadMessage("Profile image uploaded successfully. Save your profile to apply it.");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileSaving(true);

    try {
      await api.put("/api/auth/profile", {
        fullName: profileForm.fullName,
        profileImageUrl: profileForm.profileImageUrl
      });

      await refreshCurrentUser?.();
      setProfileMessage("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters");
      return;
    }

    setPasswordConfirmOpen(true);
  };

  const confirmPasswordChange = async () => {
    setPasswordSaving(true);
    setPasswordMessage("");

    try {
      await api.put("/api/auth/password", {
        newPassword: passwordForm.newPassword
      });

      onSessionEnded?.();
      setPasswordConfirmOpen(false);
      navigate("/login", {
        replace: true,
        state: {
          message: "Password changed successfully. Please log in again."
        }
      });
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordMessage(err.response?.data?.message || "Failed to update password");
      setPasswordConfirmOpen(false);
    } finally {
      setPasswordSaving(false);
    }
  };

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

        <div className="profile-settings-card">
          <div className="profile-section-heading">
            <span>Settings</span>
            <h2>Edit profile</h2>
          </div>

          <form className="profile-settings-form" onSubmit={handleProfileSubmit}>
            <label htmlFor="profileFullName">Full name</label>
            <input
              id="profileFullName"
              name="fullName"
              type="text"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              required
            />

            <label>Profile image</label>
            <div className="profile-upload-control">
              <CloudinaryUploadButton
                onUploadSuccess={handleProfileImageUploadSuccess}
                buttonLabel="Upload Profile Image"
                resourceType="image"
                className="profile-upload-btn"
              />
              <input
                id="profileImageUrl"
                name="profileImageUrl"
                type="url"
                value={profileForm.profileImageUrl}
                onChange={handleProfileChange}
                placeholder="Uploaded image URL appears here"
              />
            </div>

            {profileUploadMessage && (
              <p className="success-text profile-settings-feedback">
                {profileUploadMessage}
              </p>
            )}

            {profileForm.profileImageUrl && (
              <div className="profile-image-preview-card">
                <span>Preview</span>
                <img src={profileForm.profileImageUrl} alt="Profile preview" />
              </div>
            )}

            <button type="submit" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          {profileMessage && (
            <p
              className={
                profileMessage.toLowerCase().includes("success")
                  ? "success-text profile-settings-feedback"
                  : "error-text profile-settings-feedback"
              }
            >
              {profileMessage}
            </p>
          )}
        </div>

        <div className="profile-security-card">
          <div className="profile-section-heading">
            <span>Security</span>
            <h2>Change password</h2>
          </div>

          <div className="profile-security-warning">
            <strong>Heads up</strong>
            <p>Changing your password will log you out immediately.</p>
          </div>

          <form className="profile-settings-form" onSubmit={handlePasswordSubmit}>
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />

            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />

            <button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </form>

          {passwordMessage && (
            <p className="error-text profile-settings-feedback">
              {passwordMessage}
            </p>
          )}
        </div>
      </section>

      {passwordConfirmOpen && (
        <div className="logout-modal-backdrop" role="presentation">
          <div className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="password-confirm-title">
            <span className="logout-modal-mark">SH</span>
            <h2 id="password-confirm-title">Change password?</h2>
            <p>Your password will update immediately, and you will be redirected to login.</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-secondary"
                onClick={() => setPasswordConfirmOpen(false)}
                disabled={passwordSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-modal-primary"
                onClick={confirmPasswordChange}
                disabled={passwordSaving}
              >
                {passwordSaving ? "Changing..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
