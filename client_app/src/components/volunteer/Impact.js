import { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faSearch } from '@fortawesome/free-solid-svg-icons';
const calculateTotalHours = (shifts) => {
  return shifts.reduce((acc, shift) => {
    const start = new Date(shift.shift_start);
    const end = new Date(shift.shift_end);
    return acc + Math.round((end - start) / (1000 * 60 * 60)); // Convert milliseconds to hours
  }, 0);
};

const calculateUniqueShelters = (shifts) => {
  const uniqueShelters = new Set(shifts.map((shift) => shift.shelter));
  return uniqueShelters.size;
};

function Impact(){
  const [impactData, setImpactData] = useState({
    totalHours: 0,
    sheltersServed: 0,
  });

  useEffect(() => {
    serviceCommitmentAPI.getPastCommitments()
      .then((shifts) => {
        if (shifts && shifts.length > 0) {
          const totalHours = calculateTotalHours(shifts);
          const uniqueShelters = calculateUniqueShelters(shifts);

          setImpactData({
            totalHours,
            sheltersServed: uniqueShelters,
          });
        }
      })
      .catch((error) => console.error("Error fetching past shifts:", error));
  }, []);

  return (
    <div className="impact-container">
      <h1 className="impact-title">Your Impact</h1>
      <div className="impact-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="metric-content">
            <h4 className="metric-label">Total hours served</h4>
            <p className="metric-value">{impactData.totalHours}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <div className="metric-content">
            <h4 className="metric-label">Shelters served</h4>
            <p className="metric-value">{impactData.sheltersServed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Impact;
