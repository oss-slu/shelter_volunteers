import navigationConfig from "./NavigationConfig";
import { useNavigate } from "react-router-dom";
import { useCurrentDashboard } from "../contexts/DashboardContext.js";

function DashboardContent(){
  const navigate = useNavigate();
  const { currentDashboard } = useCurrentDashboard();

  function showDashboardItem(item, index) {
    const resolvedPath = item.path.replace(':ID', currentDashboard.id || '');

    return (
      <button
        key={index}
        type="button"
        className="dashboard-button"
        onClick={() => navigate(resolvedPath)}
      >
        <h3 className="dashboard-item">
          {item.label}
        </h3>
        {item.description && (
          <p className="tagline-small">
            {item.description}
          </p>
        )}
      </button>
    );
  }
  if (!currentDashboard) {
    return (
      <p className="page-subtitle">
        Please select a dashboard to continue
      </p>
    );
  }
  return (
    <>
      <h1 className="page-title">{currentDashboard.name}</h1>
      <p className="page-subtitle">Choose where you would like to start.</p>
      <div className="dashboard-grid">
        {navigationConfig[currentDashboard.type]?.map((item, index) => showDashboardItem(item, index))}
      </div>
    </>
  );
}

export default DashboardContent;
