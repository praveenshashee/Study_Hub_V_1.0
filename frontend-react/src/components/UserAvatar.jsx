import { useState } from "react";

function UserAvatar({ currentUser, className = "" }) {
  const [failedImageUrl, setFailedImageUrl] = useState("");

  const profileImageUrl = currentUser?.profileImageUrl?.trim() || "";
  const avatarText = currentUser?.fullName
    ? currentUser.fullName.slice(0, 2).toUpperCase()
    : "GU";

  const resolvedClassName = `${className} ${currentUser ? "" : "guest-avatar"}`.trim();
  const showProfileImage = Boolean(profileImageUrl) && failedImageUrl !== profileImageUrl;

  return (
    <span className={resolvedClassName}>
      {showProfileImage ? (
        <img
          src={profileImageUrl}
          alt={currentUser?.fullName ? `${currentUser.fullName} profile` : "Profile"}
          className="profile-avatar-image"
          onError={() => setFailedImageUrl(profileImageUrl)}
        />
      ) : (
        avatarText
      )}
    </span>
  );
}

export default UserAvatar;
