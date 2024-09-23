import Roster from "./Roster";
import { useState, useRef, useEffect } from "react";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";

const ShiftContainer = () => {
  const [shiftDetails, setShiftDetails] = useState([]);
  let shelterId = 30207;
  let startTime = 
      setHours(
        setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
        new Date().getHours() + 1,
      );

  const initialized = useRef(false);
  
  useEffect(() => {
    let start = setMilliseconds(setSeconds(setMinutes(setHours(startTime, 0), 0), 0), 0);
    const oneHourInMs = 3600 * 1000;
    const validResponses = [];

    if (!initialized.current && shelterId) {
      initialized.current = true;
      const fetchPromises = [];
      for (let i = 0; i < 24; i++) {
        const intervalStartEpoch = start.getTime() + (i * oneHourInMs);
        const intervalEndEpoch = intervalStartEpoch + oneHourInMs;
        let request_endpoint = `${SERVER}/getvolunteers/${shelterId}?filter_start_after=${intervalStartEpoch}&filter_end_before=${intervalEndEpoch}`;
        fetchPromises.push(
          fetch(request_endpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "volunteer@slu.edu",
            },
          })
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              validResponses.push(...data);
            }
          })
          .catch((error) => console.error(error))
        );
    }
    Promise.all(fetchPromises)
      .then(() => {
        validResponses.sort((a, b) => a.start_time - b.start_time);
        setShiftDetails(validResponses);
      })
      .catch((error) => {
        console.error("Error in fetching data:", error);
      });
    }
  }, [shelterId]);
  
  return (
    <>
      {shiftDetails &&  (
        <div className="shift-container">
          <Roster shiftDetails={shiftDetails} />
        </div>
      )}
    </>
  );
}

export default ShiftContainer;
