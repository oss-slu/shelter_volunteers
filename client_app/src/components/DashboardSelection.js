import { ArrowUpRight, Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import { DashboardUser } from "./DashboardUser";
import { getUser } from "../authentication/user";

const dashboardDetails = {
  volunteer: {
    label: "Volunteer workspace",
    description: "Find ways to help, manage your shifts, and see the difference you make.",
    Icon: HeartHandshake,
  },
  shelter: {
    label: "Shelter workspace",
    description: "Plan shifts, coordinate volunteers, and keep your shelter ready.",
    Icon: Building2,
  },
  admin: {
    label: "Administration",
    description: "Manage shelters, people, and access across the platform.",
    Icon: ShieldCheck,
  },
};

function DashboardSelection({ dashboards, onSelectDashboard }) {
  const user = getUser();

  return (
    <div className="home-container dashboard-selection-page">
      <div className="dashboard-selection-shell">
        <div className="dashboard-selection-brand">
          <span className="dashboard-selection-brand-mark" aria-hidden="true">
            VC
          </span>
          <span>Volunteer Connect</span>
        </div>
        <section className="dashboard-selection-hero" aria-labelledby="dashboard-selection-title">
          <div className="dashboard-selection-hero-copy">
            <DashboardUser user={user} />
            <p className="dashboard-selection-eyebrow">YOUR COMMUNITY STARTS HERE</p>
            <h1 id="dashboard-selection-title">Choose where you want to make an impact.</h1>
            <p className="dashboard-selection-intro">
              Your workspaces put the people, shifts, and tools you need in one place. Pick one to
              get started.
            </p>
          </div>
          <div className="dashboard-selection-hero-accent" aria-hidden="true">
            <span>{dashboards.length}</span>
            <span>
              workspaces
              <br />
              ready for you
            </span>
          </div>
        </section>
        <section className="dashboard-selection-content" aria-labelledby="dashboard-list-title">
          <div className="dashboard-selection-heading">
            <div>
              <p className="dashboard-selection-eyebrow">YOUR ACCESS</p>
              <h2 id="dashboard-list-title">Your dashboards</h2>
            </div>
            <span className="dashboard-selection-count">{dashboards.length} available</span>
          </div>
          <div className="dashboard-grid dashboard-selection-grid">
            {dashboards.map((dashboard) => {
              const details = dashboardDetails[dashboard.type] || dashboardDetails.volunteer;
              const Icon = details.Icon;
              return (
                <button
                  type="button"
                  key={`${dashboard.type}-${dashboard.id}`}
                  className={`dashboard-button dashboard-selection-card dashboard-selection-card--${dashboard.type}`}
                  onClick={() => onSelectDashboard(dashboard)}>
                  <span className="dashboard-selection-card-top">
                    <span className="dashboard-selection-card-icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.9} />
                    </span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                  <span className="dashboard-selection-card-label">{details.label}</span>
                  <span className="dashboard-selection-card-title">{dashboard.name}</span>
                  <span className="dashboard-selection-card-description">
                    {details.description}
                  </span>
                  <span className="dashboard-selection-card-action">
                    Open dashboard <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
          {dashboards.length > 1 && (
            <p className="dashboard-selection-hint">
              You can switch workspaces anytime from the menu at the top of a dashboard.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default DashboardSelection;
