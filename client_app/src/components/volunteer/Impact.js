import React, { useEffect, useState } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
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

const Impact = () => {
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
    <div>
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
  );
};

export default Impact;
