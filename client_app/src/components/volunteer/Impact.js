import React, { useEffect, useState } from "react";
import { SERVER } from "../../config";
import getAuthHeader from "../../authentication/getAuthHeader";

const calculateTotalHours = (shifts) => {
  return shifts.reduce((acc, shift) => {
    const start = new Date(shift.start_time);
    const end = new Date(shift.end_time);
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
    const time_now = new Date().getTime();
    const endpoint = `${SERVER}/shifts?filter_end_before=${time_now}`;
    const header = getAuthHeader();


    fetch(endpoint, { method: "GET", headers: header })
      .then((response) => response.json())
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
