import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 
import { useEffect } from "react";


function HomeDashboard() {
    const navigate = useNavigate(); 
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
          navigate("/dashboard"); // trying to fix redirecting issue 
        }
      }, [token, navigate]);

    return(
      <div className = "home-dashboard">
        <h1>Shelter Volunteer Main System</h1>
        <p>Please select your role to continue:</p>
        <div className = "select-role">
          <button onClick={() => navigate("/volunteer-login")} className = "volunteer-button">
            Volunteer Login
          </button>
          <button onClick={() => navigate("/shelter-login")} className = "shelter-button">
            Shelter Admin Login
          </button>
        </div>
      </div>
    );
}
export default HomeDashboard; 