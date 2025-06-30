import "./../styles/HomeDashboard.css";
import Login from "./authentication/GoogleLogin";
import Loading from "./Loading";
import DashboardSelection from "./DashboardSelection";
import { useDashboards, useCurrentDashboard } from "../contexts/DashboardContext.js";
import {useAuth} from "../contexts/AuthContext.js";

function HomeDashboard() {
  const {onSelectDashboard} = useCurrentDashboard();
  const {dashboards, loadingDashboards} = useDashboards();
  const {isAuthenticated} = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (loadingDashboards) {
    return <Loading />;
  }

  return (
    <DashboardSelection
       dashboards={dashboards}
       onSelectDashboard={onSelectDashboard}/>
  );
}

export default HomeDashboard;