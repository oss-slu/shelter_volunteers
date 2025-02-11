import "./../styles/HomeDashboard.css";
import {useNavigate} from "react-router-dom"; 


function HomeDashboard() {
  const navigate = useNavigate();
    return (
      <div className="home-dashboard">
        <header className="home-header">
          <h1>Shelter Volunteer Management System</h1>
        </header>
        <p>Please select your role to continue:</p>
        <div className="select-role">
          <button
            onClick={() => navigate("/volunteer-login")}
            className="volunteer-button"
          >
            Volunteer Login
          </button>
          <button
            onClick={() => navigate("/shelter-login")}
            className="shelter-button"
          >
            Shelter Admin Login
          </button>
        </div>
      </div>
    );
}
export default HomeDashboard; 