import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect, useState } from "react";
import Login from "./authentication/GoogleLogin";
import { permissionsAPI } from "../api/permission";
import { shelterAPI } from "../api/shelter";
import DashboardLoading from "./DashboardLoading";
import DashboardSelection from "./DashboardSelection";
import DashboardContent from "./DashboardContent";


function HomeDashboard({ setAuth, auth, currentDashboard, setCurrentDashboard }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboards, setDashboards] = useState([]);

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
              { type: "volunteer", id: "volunteer-dashboard", name: "Volunteer Dashboard" },
              ...(systemAccess ? [{ type: "admin", id: "admin-dashboard", name: "System Admin Dashboard" }] : []),
              ...filteredShelterInfo.map(shelter => ({ type: "shelter", id: shelter._id, name: shelter.name }))
            ]);
            setLoading(false);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };
    fetchPermissions();
  }, [auth]);

  const handleSelectDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (!auth) {
    return <Login setAuth={setAuth}/>;
  }

  if (currentDashboard) {
    return <DashboardContent dashboard={currentDashboard}/>;
  }

  return (
    <DashboardSelection
       dashboards={dashboards}
       user={{name: "kate", email: "kate.holdener@gmail.com"}}
       onSelectDashboard={handleSelectDashboard}/>
  );
}

export default HomeDashboard;