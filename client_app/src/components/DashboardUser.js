export const DashboardUser = ({ user }) => {
  const name = user?.name || "Volunteer";

  return (
    <div className="dashboard-user">
      {user?.picture ? (
        <img src={user.picture} alt="" className="profile-picture" />
      ) : (
        <span className="profile-picture profile-picture--fallback" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="dashboard-user-copy">
        <span className="dashboard-user-label">WELCOME BACK</span>
        <span className="user-name">{name}</span>
        {user?.email && <span className="user-email">{user.email}</span>}
      </div>
    </div>
  );
};
