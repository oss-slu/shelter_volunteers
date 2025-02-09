import { useState, useEffect } from "react";
import { SERVER } from "../../config";
import ShiftList from "./ShiftList";
import getAuthHeader from "../../authentication/getAuthHeader";

function Shifts({ request_endpoint }) {
  const [data, setData] = useState([]);
  const header = getAuthHeader();

  useEffect(() => {
    console.log("Fetching shifts from:", request_endpoint); // Debugging
    fetch(request_endpoint, {
      method: "GET", // Corrected typo
      headers: header,
    })
      .then((response) => {
        console.log("Response Status:", response.status); // Debugging
        return response.json();
      })
      .then((response) => {
        setData(response);
      })
      .catch((error) => console.error("Error fetching shifts:", error));
  }, [request_endpoint]);

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
  const shelters_endpoint = `${SERVER}/shifts?filter_start_after=${time_now}`;

  return (
    <div>
      <h1 className="text-center">Upcoming Shifts</h1>
      <Shifts request_endpoint={shelters_endpoint} />
    </div>
  );
}

export function PastShifts() {
  const time_now = new Date().getTime();
  const shelters_endpoint = `${SERVER}/shifts?filter_end_before=${time_now}`;
  console.log("Past Shifts Endpoint:", shelters_endpoint); // Debugging

  return (
    <div>
      <h1 className="text-center">Previous Shifts</h1>
      <Shifts request_endpoint={shelters_endpoint} />
    </div>
  );
}

export default Shifts;
