import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect, useState } from "react";
import Login from "./authentication/GoogleLogin";
import { permissionsAPI } from "../api/permission";
import { shelterAPI } from "../api/shelter";

function HomeDashboard({ setAuth, auth }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSystemAdmin, setSystemAdmin] = useState(false);
  const [shelterInfo, setShelterInfo] = useState([]);
  
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
            setLoading(false);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };
    fetchPermissions();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!auth) {
    return <Login setAuth={setAuth}/>;
  }

  return (
    <div className="home-dashboard">
      <header className="home-header">
        <h1>Shelter Volunteer Management System</h1>
      </header>
      <div className="select-role">
        <button
          onClick={() => navigate("/volunteer-dashboard")}
          className="volunteer-button"
        >
          Your Volunteer Dashboard
        </button>
        {shelterInfo.length > 0 && (
          <>
            {shelterInfo.map((shelter) => (
              <button
                key={shelter._id}
                onClick={() => navigate(`/shelter-dashboard/${shelter._id}`)}
                className="shelter-button"
              >
                {shelter.name} Dashboard
              </button>
            ))}
          </>
        )}
        {isSystemAdmin && (
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="admin-button"
          >
            System Admin Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
export default HomeDashboard;