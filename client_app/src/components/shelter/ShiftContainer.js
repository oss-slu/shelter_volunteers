import Roster from "./Roster";
import { useState, useRef, useEffect } from "react";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";
import ShiftDetailsModal from "./ShiftDetailsModal";

const ShiftContainer = (props) => {
  const [shiftDetails, setShiftDetails] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shelterId, setShelterId] = useState(30207);
  const [startTime, setStartDate] = useState(
      setHours(
        setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
        new Date().getHours() + 1,
      ),
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
  }, [shelterId, startTime]);
  
  // Open modal and set selected shift
  const handleMoreDetailsClick = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };

  const handleRequestMoreVolunteers = () => {
    // Logic for requesting more volunteers
    console.log("Requesting more volunteers for shift:", selectedShift);
  };

  const handleCloseSignups = () => {
    // Logic for closing volunteer sign-ups
    console.log("Closing sign-ups for shift:", selectedShift);
  };

  const handleCloseRequest = () => {
    // Logic for closing or deleting the shift request
    console.log("Closing request for shift:", selectedShift);
  };
  
  return (
    <>
      {shiftDetails &&  (
        <div className="shift-container">
          <Roster 
            shiftDetails={shiftDetails} 
            onMoreDetailsClick={handleMoreDetailsClick} // Pass the click handler to Roster
          />
        </div>
      )}
      {/* Show the modal if a shift is selected */}
      {isModalOpen && (
        <ShiftDetailsModal 
          shift={selectedShift} 
          onClose={handleCloseModal} 
          onRequestMoreVolunteers={handleRequestMoreVolunteers}
          onCloseSignups={handleCloseSignups}
          onCloseRequest={handleCloseRequest}
        />
      )}
    </>
  );
}

export default ShiftContainer;
