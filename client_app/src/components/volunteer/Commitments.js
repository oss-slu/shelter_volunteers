import { useState, useEffect } from "react";
import ShiftList from "./ShiftList";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";

function Commitments({ request_api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    request_api()
      .then((response) => {
        setData(response);
      })
      .catch((error) => console.error("Error fetching shifts:", error));
  }, [request_api]);

  const handleCancelCommitment = (commitmentId) => {
    serviceCommitmentAPI.cancelCommitment(commitmentId)
      .then(() => {
        setData((prevData) => prevData.filter((commitment) => commitment._id !== commitmentId));
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <ShiftList shifts={data} onCancelShift={handleCancelCommitment} />
    </div>
  );
}

export function UpcomingCommitments() {
  return (
    <div>
      <h1 className="text-center">Upcoming Commitments</h1>
      <Commitments request_api={serviceCommitmentAPI.getFutureCommitments} />
    </div>
  );
}

export function PastCommitments() {
  return (
    <div>
      <h1 className="text-center">Previous Commitments</h1>
      <Commitments request_api={serviceCommitmentAPI.getPastCommitments} />
    </div>
  );
}

export default Commitments;
