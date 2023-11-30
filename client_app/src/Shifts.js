import { useState, useEffect } from "react";

import { SERVER } from "./config";

import ShiftList from "./Components/ShiftList";
import getAuthHeader from "./authentication/getAuthHeader";

function Shifts(request_endpoint) {
  const [data, setData] = useState([]);
  const header = getAuthHeader();

  useEffect(() => {
    fetch(request_endpoint, {
      methods: "GET",
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => setData(response))
      .catch((error) => console.log(error));
  },[]);

  const handleCancelShift = (shiftCode) => {
    fetch(`${SERVER}/shifts/${shiftCode}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "volunteer@slu.edu",
      },
    })
      .then((response) => {
        if (response.ok) {
          setData((prevData) => prevData.filter((shift) => shift.code !== shiftCode));
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
      <h1 class="text-center">Upcoming Shifts</h1>
      {Shifts(shelters_endpoint)}
    </div>
  );
}

export function PastShifts() {
  const time_now = new Date().getTime();
  const shelters_endpoint = SERVER + "/shifts?filter_end_before=" + time_now;
  return (
    <div>
      <h1 class="text-center">Previous Shifts</h1>
      {Shifts(shelters_endpoint)}
    </div>
  );
}
