import { useState, useEffect } from "react";
import { SERVER } from "../../config";
import ShiftList from "./ShiftList";
import getAuthHeader from "../../authentication/getAuthHeader";

// Utility functions for calculations
const calculateTotalHours = (shifts) => {
  return shifts.reduce((total, shift) => {
    const start = new Date(shift.start_time);
    const end = new Date(shift.end_time);
    return total + Math.round((end - start) / (1000 * 60 * 60)); // Convert milliseconds to hours
  }, 0);
};

const calculateUniqueShelters = (shifts) => {
  const uniqueShelters = new Set(shifts.map((shift) => shift.shelter_id));
  return uniqueShelters.size;
};

function Shifts(request_endpoint) {
  const [data, setData] = useState([]);
  const header = getAuthHeader();

  useEffect(() => {
    fetch(request_endpoint, {
      method: "GET",
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => setData(response))
      .catch((error) => console.log(error));
  }, []);

  const handleCancelShift = (shiftCode) => {
    fetch(`${SERVER}/shifts/${shiftCode}`, {
      method: "DELETE",
      headers: header,
    })
      .then((response) => {
        if (response.ok) {
          setData((prevData) => prevData.filter((shift) => shift._id !== shiftCode));
        } else {
          console.error("Failed to cancel shift");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <ShiftList shifts={data} onCancelShift={handleCancelShift} />
    </div>
  );
}

export function UpcomingShifts() {
  const time_now = new Date().getTime();
  const shelters_endpoint = SERVER + "/shifts?filter_start_after=" + time_now;
  return (
    <div>
      <h1 className="text-center">Upcoming Shifts</h1>
      {Shifts(shelters_endpoint)}
    </div>
  );
}

export function PastShifts({ onImpactDataUpdate }) {
  const time_now = new Date().getTime();
  const shelters_endpoint = SERVER + "/shifts?filter_end_before=" + time_now;
  const header = getAuthHeader();

  useEffect(() => {
    fetch(shelters_endpoint, {
      method: "GET",
      headers: header,
    })
      .then((response) => response.json())
      .then((shifts) => {
        const totalHours = calculateTotalHours(shifts);
        const sheltersServed = calculateUniqueShelters(shifts);
        onImpactDataUpdate({ totalHours, sheltersServed });
      })
      .catch((error) => console.log(error));
  }, [shelters_endpoint, onImpactDataUpdate]);

  return (
    <div>
      <h1 className="text-center">Previous Shifts</h1>
    </div>
  );
}
