import navigationConfig from "./NavigationConfig";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar.js";
function DashboardContent({ dashboard }){
  const navigate = useNavigate();

  function showDashboardItem(item, index) {
    const resolvedPath = item.path.replace(':ID', dashboard.id || '');

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
  if (!dashboard) {
    return (
      <div className="home-container">
        Please select a dashboard to continue
      </div>
    );
  }
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <Sidebar
          dashboard={dashboard}
          isOpen={true}
          onClose={() => {}}
        />
        <h1 className="title-small">
          {dashboard.name}
        </h1>
        <div className="dashboard-grid">
          {navigationConfig[dashboard.type]?.map((item, index) => showDashboardItem(item, index))}
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;
