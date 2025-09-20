import { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";

// completed only
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
  return Number(totalHoursFloat.toFixed(1));
};

const calculateUniqueShelters = (shifts) => {
  const ids = shifts
    .map((s) => (s?.shelter?._id ?? s?.shelter ?? null))
    .filter(Boolean);
  return new Set(ids).size;
};

function Impact() {
  const [impactData, setImpactData] = useState({ totalHours: 0, sheltersServed: 0 });

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

  // shared tile/card styles
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  };
  const card = {
    borderRadius: 16,
    padding: "16px 18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "white",
    display: "flex",
    alignItems: "center",
  };
  const iconWrap = {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.12)", // soft indigo bubble
    marginRight: 12,
  };
  const title = { margin: 0, fontSize: 14, opacity: 0.75 };
  const value = { margin: 0, fontSize: 26, fontWeight: 700 };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: 18 }}>Your Impact</h3>
      <div style={gridStyle}>
        {/* Total Hours */}
        <div style={card}>
          <div style={iconWrap} aria-hidden="true">
            {/* clock icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" />
              <path d="M12 7v5l4 2" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={title}>Total hours served</p>
            <p style={value}>{impactData.totalHours}</p>
          </div>
        </div><div style={card}>
          {/* Shelters Served */}
          <div style={{ ...iconWrap, background: "rgba(16,185,129,0.12)" }} aria-hidden="true">
            {/* home icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 11l9-7 9 7" stroke="currentColor" strokeLinecap="round" />
              <path d="M5 10v10h14V10" stroke="currentColor" />
            </svg>
          </div>
          <div>
            <p style={title}>Shelters served</p>
            <p style={value}>{impactData.sheltersServed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Impact;
