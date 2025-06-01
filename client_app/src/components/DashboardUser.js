export const DashboardUser = ({ user }) => {
  return(
    <div className = "dashboard-user">
      <img
        src={user.picture}
        alt={user.name}
        className="profile-picture"
      />
      <div style={{ textAlign: 'left' }}>
        <h2 className="user-name">
          Welcome, {user.name}!
        </h2>
        <p className="user-email">
          {user.email}
        </p>
      </div>
    </div>
  );
}