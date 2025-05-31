import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect, useState } from "react";
import Login from "./authentication/GoogleLogin";
import { permissionsAPI } from "../api/permission";
import { shelterAPI } from "../api/shelter";
import { set } from "date-fns";
import DashboardLoading from "./DashboardLoading";
import DashboardSelection from "./DashboardSelection";

function HomeDashboard({ setAuth, auth }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSystemAdmin, setSystemAdmin] = useState(false);
  const [shelterInfo, setShelterInfo] = useState([]);
  const [dashboards, setDashboards] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!auth) {
        setLoading(false);
      } else {
        try {
            const permissions = await permissionsAPI.getPermissions();
            console.log(permissions);
            const fullAccess = permissions.full_access || [];

            let systemAccess = false; 
            let shelterAccess = false;
            if (fullAccess) {
              shelterAccess = fullAccess.find(access => access.resource_type === "shelter");
              systemAccess = fullAccess.find(access => access.resource_type === "system");
            }

            setSystemAdmin(systemAccess);
            if (shelterAccess) {
              const sheltersInfoAll = await shelterAPI.getShelters();
              setShelterInfo(sheltersInfoAll.filter(shelter => shelterAccess.resource_ids.includes(shelter._id)));
            }
            dashboards.push(
              { type: "volunteer", id: "volunteer-dashboard", name: "Volunteer Dashboard" },
              ...shelterInfo.map(shelter => ({ type: "shelter", id: shelter._id, name: shelter.name })),
              ...(systemAccess ? [{ type: "admin", id: "admin-dashboard", name: "System Admin Dashboard" }] : [])
            );
            setDashboards(dashboards);
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
    return <Login setAuth={setAuth}/>;
  }

  return (
    <DashboardSelection
       dashboards={dashboards}
       user={{name: "kate", email: "kate.holdener@gmail.com"}}/>
  );
}
export default HomeDashboard;