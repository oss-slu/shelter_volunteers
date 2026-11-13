import navigationConfig from "./NavigationConfig";
import { useNavigate } from "react-router-dom";
import { useCurrentDashboard } from "../contexts/DashboardContext.js";
import NearbySheltersMap from "./volunteer/NearbySheltersMap";

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
  const options = (
    <div className="dashboard-grid">
      {navigationConfig[currentDashboard.type]?.map((item, index) => showDashboardItem(item, index))}
    </div>
  );

  return (
    <>
      <h1 className="page-title">{currentDashboard.name}</h1>
      <p className="page-subtitle">Choose where you would like to start.</p>
      {currentDashboard.type === "volunteer" ? (
        // Volunteers get the options next to a map of nearby shelters with open shifts.
        <div className="volunteer-home">
          {options}
          <div className="volunteer-home-map">
            <NearbySheltersMap />
          </div>
        </div>
      ) : (
        options
      )}
    </>
  );
}

export default DashboardContent;
