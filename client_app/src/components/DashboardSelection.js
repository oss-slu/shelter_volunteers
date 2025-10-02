import { DashboardUser } from './DashboardUser';
import { getUser } from '../authentication/user';
function DashboardSelection({ dashboards, onSelectDashboard }){
  const user = getUser();
  return(
    <div className="home-container">
      <div className="content-wrapper">
        <DashboardUser user={user} />
        <h1 className="title-small">
          Choose Your <span style={{ color: '#2563eb' }}>Dashboard</span>
        </h1>
        <p className="tagline">
          {dashboards.length === 1 
          ? "You have access to one dashboard. Click below to continue."
          : `You have access to ${dashboards.length} dashboards. Select one to get started.`
          }
        </p>
        <div className="dashboard-grid">
          {dashboards.map((dashboard) => {
          return (
            <button
              key={dashboard.id}
              className="dashboard-button" onClick={() => onSelectDashboard(dashboard)}>
              <h3 className="dashboard-item">
                {dashboard.name}
              </h3>
              <p className="tagline-small">
                {dashboard.type === 'volunteer' && 'Access your volunteer activities and find new opportunities'}
                {dashboard.type === 'shelter' && 'Manage shelter shifts, volunteers, and shelter operations'}
                {dashboard.type === 'admin' && 'System administration and user management'}
              </p>
            </button>
          );

        })}
        </div>  
        {dashboards.length > 1 && (
          <p className="tagline-small">
            You can switch between dashboards anytime using the dropdown menu
          </p>
        )}
      </div>
    </div>
  );
}
export default DashboardSelection;