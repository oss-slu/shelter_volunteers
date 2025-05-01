import { useState, useEffect } from "react";
import { SERVER } from "../../config";
import ShiftList from "./ShiftList";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";

function Shifts({ request_api }) {
  const [data, setData] = useState([]);

  
  useEffect(() => {
    request_api()
      .then((response) => {
        return response;
      })
      .then((response) => {
        setData(response);
      })
      .catch((error) => console.error("Error fetching shifts:", error));
  }, [request_api]);

  const handleCancelShift = (shiftCode) => {
    fetch(`${SERVER}/shifts/${shiftCode}`, {
      method: "DELETE"
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
  return (
    <div>
      <h1 className="text-center">Upcoming Shifts</h1>
      <Shifts request_api={serviceCommitmentAPI.getFutureCommitments} />
    </div>
  );
}

export function PastShifts() {
  return (
    <div>
      <h1 className="text-center">Previous Shifts</h1>
      <Shifts request_api={serviceCommitmentAPI.getPastCommitments} />
    </div>
  );
}

export default Shifts;
