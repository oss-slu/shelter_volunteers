import navigationConfig from "./NavigationConfig";
import { useNavigate } from "react-router-dom";
import { useCurrentDashboard } from "../contexts/DashboardContext.js";
function DashboardContent(){
  const navigate = useNavigate();
  const { currentDashboard } = useCurrentDashboard();
  console.log("DashboardContent rendered with dashboard:", currentDashboard);
  function showDashboardItem(item, index) {
    const resolvedPath = item.path.replace(':ID', currentDashboard.id || '');

    return (
      <button
        key={index}
        className="dashboard-button"
        onClick={() => navigate(resolvedPath)}
      >
        <h3 className="dashboard-item">
          {item.label}
        </h3>
        <p className="tagline-small">
          {item.description}
        </p>
      </button>
    );
  }  
  if (!currentDashboard) {
    return (
      <div className="home-container">
        Please select a dashboard to continue
      </div>
    );
  }
  return (<div className="dashboard-grid">
    {navigationConfig[currentDashboard.type]?.map((item, index) => showDashboardItem(item, index))}
  </div>
  );
}

export default DashboardContent;
