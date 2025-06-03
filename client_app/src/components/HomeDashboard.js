import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect, useState } from "react";
import Login from "./authentication/GoogleLogin";
import { permissionsAPI } from "../api/permission";
import { shelterAPI } from "../api/shelter";
import DashboardLoading from "./DashboardLoading";
import DashboardSelection from "./DashboardSelection";
import DashboardContent from "./DashboardContent";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar.js";
import { useDashboards, useCurrentDashboard } from "../contexts/DashboardContext.js";
function HomeDashboard({ setAuth, auth, currentUser, setCurrentUser }) {
  const [loading, setLoading] = useState(true);
  const {_, onSelectDashboard} = useCurrentDashboard();
  const {dashboards, setDashboards} = useDashboards();
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!auth) {
        setLoading(false);
      } else {
        try {
            setLoading(true);
            const permissions = await permissionsAPI.getPermissions();
            console.log(permissions);
            const fullAccess = permissions ? permissions.full_access: [];

            let systemAccess = false; 
            let shelterAccess = false;
            if (fullAccess) {
              shelterAccess = fullAccess.find(access => access.resource_type === "shelter");
              systemAccess = fullAccess.find(access => access.resource_type === "system");
            }
            console.log("Shelter Access:", shelterAccess);
            let filteredShelterInfo = [];
            if (shelterAccess) {
              const sheltersInfoAll = await shelterAPI.getShelters();
              filteredShelterInfo = sheltersInfoAll.filter(shelter => shelterAccess.resource_ids.includes(shelter._id));
            }
            setDashboards([
              { type: "volunteer", id: "volunteer-dashboard", name: "Volunteer Dashboard", path: "/volunteer-dashboard" },
              ...(systemAccess ? [{ type: "admin", id: "admin-dashboard", name: "System Admin Dashboard", path: "admin-dashboard" }] : []),
              ...filteredShelterInfo.map(shelter => ({ type: "shelter", id: shelter._id, name: shelter.name, path: `/shelter-dashboard/${shelter._id}` })),
            ]);
            setLoading(false);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };
    fetchPermissions();
  }, [auth]);

  if (loading) {
    return <DashboardLoading />;
  }

  if (!auth) {
    return <Login setAuth={setAuth} setCurrentUser={setCurrentUser}/>;
  }

  return (
    <DashboardSelection
       dashboards={dashboards}
       user={currentUser}
       onSelectDashboard={onSelectDashboard}/>
  );
}

export default HomeDashboard;