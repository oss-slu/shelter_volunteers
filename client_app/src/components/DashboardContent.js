import { ArrowUpRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import navigationConfig from "./NavigationConfig";
import { useCurrentDashboard } from "../contexts/DashboardContext.js";

const workspaceDescription = {
  volunteer: "Find opportunities, keep track of your shifts, and see the impact of your time.",
  shelter: "Plan your schedule, welcome volunteers, and keep your shelter running smoothly.",
  admin: "Manage your shelter network and the people who keep it moving.",
};

function DashboardContent() {
  const navigate = useNavigate();
  const { currentDashboard } = useCurrentDashboard();

  if (!currentDashboard) {
    return <div className="dashboard-home-empty">Please select a dashboard to continue.</div>;
  }

  const menuItems = navigationConfig[currentDashboard.type] || [];

  return (
    <div className="dashboard-home">
      <section className={`dashboard-home-hero dashboard-home-hero--${currentDashboard.type}`}>
        <span className="dashboard-home-eyebrow">YOUR WORKSPACE</span>
        <h1>{currentDashboard.name}</h1>
        <p>{workspaceDescription[currentDashboard.type]}</p>
      </section>
      <div className="dashboard-home-heading">
        <div>
          <span className="dashboard-home-eyebrow">GET STARTED</span>
          <h2>What would you like to do?</h2>
        </div>
        <span>{menuItems.length} tools available</span>
      </div>
      <div className="dashboard-grid dashboard-home-grid">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.path}
            className="dashboard-button dashboard-home-card"
            onClick={() => navigate(item.path.replace(":ID", currentDashboard.id || ""))}>
            <span className="dashboard-home-card-top">
              <span className="dashboard-home-card-icon" aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
            <span className="dashboard-home-card-title">{item.label}</span>
            <span className="dashboard-home-card-description">
              {item.description || "Open this area of your dashboard."}
            </span>
            <span className="dashboard-home-card-action">
              Open <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DashboardContent;
