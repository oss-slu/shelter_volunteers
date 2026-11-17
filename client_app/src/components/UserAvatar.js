import { useState } from "react";

export function initialsFor(name = "", email = "") {
  const source = (name || email || "").trim();
  if (!source) return "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Profile picture with an initials fallback when there is no picture
 * or it fails to load.
 */
function UserAvatar({ user, className = "user-avatar" }) {
  const [failed, setFailed] = useState(false);
  const picture = user?.picture;

  if (!picture || failed) {
    return (
      <span className={`${className} user-avatar-fallback`} aria-hidden="true">
        {initialsFor(user?.name, user?.email)}
      </span>
    );
  }
  return (
    <img
      src={picture}
      alt=""
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default UserAvatar;
