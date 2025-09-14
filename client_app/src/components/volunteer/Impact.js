import { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";

// Count only completed shifts (have an end time not in the future)
const onlyCompleted = (shift) => {
  if (!shift?.shift_end || !shift?.shift_start) return false;
  const end = new Date(shift.shift_end);
  return !Number.isNaN(end.getTime()) && end <= new Date();
};

const calculateTotalHours = (shifts) => {
  const totalHoursFloat = shifts.reduce((acc, shift) => {
    const start = new Date(shift.shift_start);
    const end = new Date(shift.shift_end);
    if (Number.isNaN(start) || Number.isNaN(end)) return acc;
    const ms = Math.max(0, end - start);
    return acc + ms / (1000 * 60 * 60);
  }, 0);
  return Number(totalHoursFloat.toFixed(1)); // one decimal
};

const calculateUniqueShelters = (shifts) => {
  const ids = shifts
    .map((s) => (s?.shelter?._id ?? s?.shelter ?? null))
    .filter(Boolean);
  return new Set(ids).size;
};

function Impact() {
  const [impactData, setImpactData] = useState({
    totalHours: 0,
    sheltersServed: 0,
  });

  useEffect(() => {
    serviceCommitmentAPI
      .getPastCommitments()
      .then((shifts = []) => {
        const completed = shifts.filter(onlyCompleted);
        setImpactData({
          totalHours: calculateTotalHours(completed),
          sheltersServed: calculateUniqueShelters(completed),
        });
      })
      .catch((error) => console.error("Error fetching past shifts:", error));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Impact Created</h3>
      <div className="card" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <h4 style={{ margin: 0 }}>Total hours served</h4>
        <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 600 }}>{impactData.totalHours}</p>
      </div><div className="card" style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <h4 style={{ margin: 0 }}>Lives Touched</h4>
        <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.75 }}>Too many to count</p>
      </div><div className="card" style={{ borderRadius: 12, padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <h4 style={{ margin: 0 }}>Shelters served</h4>
        <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 600 }}>{impactData.sheltersServed}</p>
      </div>
    </div>
  );
}

export default Impact;
