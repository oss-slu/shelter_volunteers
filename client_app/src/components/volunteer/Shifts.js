import { useState, useEffect } from "react";
import ShiftList from "./ShiftList";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";

function Shifts({ request_api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    request_api()
      .then((response) => {
        setData(response);
      })
      .catch((error) => console.error("Error fetching shifts:", error));
  }, [request_api]);

  const handleCancelShift = (commitmentCode) => {
    serviceCommitmentAPI.cancelCommitment(commitmentCode)
      .then(() => {
        setData((prevData) => prevData.filter((shift) => shift._id !== commitmentCode));
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
