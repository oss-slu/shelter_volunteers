import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect, useState } from "react";
import Login from "./authentication/Login";
import { permissionsAPI } from "../api/permission";

function HomeDashboard({ setAuth }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSystemAdmin, setSystemAdmin] = useState(false);
  const [isShelterAdmin, setShelterAdmin] = useState(false);
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    console.log("We are here");
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found");
        setIsAuthenticated(false);
        setLoading(false);
      } else {
        try {
            const permissions = await permissionsAPI.getPermissions();
            console.log(permissions);
            const fullAccess = permissions.full_access || [];

            const systemAccess = fullAccess.find(access => access.resource_type === "system");
            const shelterAccess = fullAccess.find(access => access.resource_type === "shelter");

            setSystemAdmin(systemAccess);
            setShelterAdmin(shelterAccess && shelterAccess.resource_ids.length > 0);
            setShelters(shelterAccess ? shelterAccess.resource_ids : []);

            setIsAuthenticated(true);
            setLoading(false);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };

    fetchPermissions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
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
        {isShelterAdmin && (
        <button
          onClick={() => navigate("/shelter-dashboard")}
          className="shelter-button"
        >
          Shelter Admin Dashboard
        </button>
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