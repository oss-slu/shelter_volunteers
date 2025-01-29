import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shelters from "./Shelters";
import { UpcomingShifts, PastShifts } from "./Shifts";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [impactData, setImpactData] = useState({
    totalHours: 0,
    sheltersServed: 0,
  });

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
          <p>{impactData.totalHours}</p>
        </div>
        <div className="card">
          <h4>Lives Touched</h4>
          <p>Too many to count</p>
        </div>
        <div className="card">
          <h4>Shelters served</h4>
          <p>{impactData.sheltersServed}</p>
        </div>
      </div>
      <div className="cta-button">
        <button onClick={signupClick}>Sign up for shifts</button>
      </div>
      <PastShifts onImpactDataUpdate={(data) => setImpactData(data)} />
    </div>
  );
}

export default VolunteerDashboard;
