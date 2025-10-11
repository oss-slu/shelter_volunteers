import { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faSearch } from '@fortawesome/free-solid-svg-icons';
import "../../styles/volunteer/Impact.css";

const onlyCompleted = (s) => {
  if (!s?.shift_end || !s?.shift_start) return false;
  const end = new Date(s.shift_end);
  return !Number.isNaN(end.getTime()) && end <= new Date();
};

const calculateTotalHours = (shifts) => {
  const total = shifts.reduce((acc, s) => {
    const start = new Date(s.shift_start);
    const end = new Date(s.shift_end);
    if (Number.isNaN(start) || Number.isNaN(end)) return acc;
    return acc + Math.max(0, end - start) / (1000 * 60 * 60);
  }, 0);
  return Number(total.toFixed(1));
};

const calculateUniqueShelters = (shifts) => {
  const ids = shifts.map((s) => (s?.shelter?._id ?? s?.shelter ?? null)).filter(Boolean);
  return new Set(ids).size;
};

const onlyCompleted = (shift) => !!shift.shift_end;

function Impact() {
  const [impactData, setImpactData] = useState({ totalHours: 0, sheltersServed: 0 });

  useEffect(() => {
    serviceCommitmentAPI.getPastCommitments()
      .then((shifts = []) => {
        const completed = shifts.filter(onlyCompleted);
        setImpactData({
          totalHours: calculateTotalHours(completed),
          sheltersServed: calculateUniqueShelters(completed),
        });
      })
      .catch((e) => console.error("Error fetching past shifts:", e));
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