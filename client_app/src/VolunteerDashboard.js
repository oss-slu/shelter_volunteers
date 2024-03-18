import { Link,useNavigate } from "react-router-dom";
import Shelters from "./Shelters";
import { UpcomingShifts } from "./Shifts";

function VolunteerDashboard() {
  const navigate = useNavigate();
  function signupClick() {
    navigate("/shelters");
  }
  return (
    <div className="volunteer-dashboard">
      <div className="column column-1">
        <h3>Upcoming Shifts</h3>
        <div className="no-title">
          <UpcomingShifts />
        </div>
      </div>

      <div className="column column-2">
        <h3>Shelters looking for Volunteers</h3>
        <Shelters condensed={true} />
      </div>

      <div className="column column-3">
        <h3>Impact Created</h3>
        <div className="card">
          <h4>Total hours served</h4>
          <p>106</p>
        </div>

        <div className="card">
          <h4>Lives Touched</h4>
          <p>17</p>
        </div>

        <div className="card">
          <h4>Shelters served</h4>
          <p>4</p>
        </div>
      </div>
      <div className="cta-button">
        <button onClick={signupClick}>Sign up for shifts</button>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
