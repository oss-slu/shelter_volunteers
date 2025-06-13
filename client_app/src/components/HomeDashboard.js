import "./../styles/HomeDashboard.css";
import Login from "./authentication/GoogleLogin";
import DashboardLoading from "./DashboardLoading";
import DashboardSelection from "./DashboardSelection";
import { useDashboards, useCurrentDashboard } from "../contexts/DashboardContext.js";

function HomeDashboard({ setAuth, auth, currentUser }) {
  const {onSelectDashboard} = useCurrentDashboard();
  const {dashboards, loadingDashboards} = useDashboards();
  if (!auth) {
    return <Login setAuth={setAuth}/>;
  }

  if (loadingDashboards) {
    return <DashboardLoading />;
  }

  return (
    <DashboardSelection
       dashboards={dashboards}
       user={currentUser}
       onSelectDashboard={onSelectDashboard}/>
  );
}

export default HomeDashboard;