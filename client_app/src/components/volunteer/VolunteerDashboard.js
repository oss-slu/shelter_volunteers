import { useNavigate } from "react-router-dom";
import Shelters from "./Shelters";
import { UpcomingShifts } from "./Shifts";
import Impact from "./Impact";

function VolunteerDashboard() {
  const navigate = useNavigate();

  const signupClick = () => {
    navigate("/shelters");
  };

  return (
    <div className="volunteer-dashboard">
      <div className="column column-1">
        <h3>Upcoming Shifts</h3><UpcomingShifts />
      </div>
      <div className="column column-2">
        <h3>Shelters looking for Volunteers</h3><Shelters condensed={true} />
      </div>
      <div className="column column-3">
        <Impact />
      </div>
      <div className="cta-button">
        <button onClick={signupClick}>Sign up for shifts</button>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
