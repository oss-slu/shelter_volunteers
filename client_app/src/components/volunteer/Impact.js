import { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
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
    <div className="impact">
      <h3 className="impact__heading">Your Impact</h3>
      <div className="impact__grid">
        <div className="impact__card">
          <div className="impact__icon impact__icon--indigo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" />
              <path d="M12 7v5l4 2" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="impact__title">Total hours served</p>
            <p className="impact__value">{impactData.totalHours}</p>
          </div>
        </div><div className="impact__card">
          <div className="impact__icon impact__icon--green" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 11l9-7 9 7" stroke="currentColor" strokeLinecap="round" />
              <path d="M5 10v10h14V10" stroke="currentColor" />
            </svg>
          </div>
          <div>
            <p className="impact__title">Shelters served</p>
            <p className="impact__value">{impactData.sheltersServed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Impact;
