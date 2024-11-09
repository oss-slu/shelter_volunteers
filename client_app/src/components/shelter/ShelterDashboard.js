import React from "react";
import OpenRequest from "./OpenRequests";
import PastVolunteersContainer from "./PastVolunteersContainer";
import ShiftContainer from "./ShiftContainer";
import "../../styles/index.css";
import { useState, useRef, useEffect } from "react";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";


function ShelterDashboard() {
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
    <div>
      <div className="shelter-dashboard">
        <div className="container-large">
          <div className="container-align">
            <h4>Open requests</h4>
            <a href="/shift-details">View all</a>
          </div>
          <OpenRequest />
        </div>
        <div className="container-medium">
          <div className="container-align">
            <h4>Today's Roster</h4>
            <a href="/shift-details">View all</a>
          </div>
          <ShiftContainer shiftDetails={shiftDetails} />
        </div>
        <div className="container-small">
          <div className="container-align">
            <h4>Contact Past Volunteers</h4>
            <button
              style={{
                backgroundColor: "#f9f6f6",
                border: "none",
                outline: "none",
                color: "#0066b2",
                fontSize: "1.0rem",
                textDecoration: "underline",
                textAlign: "center",
                padding: "0"
              }}>
              View all
            </button>
          </div>
          <PastVolunteersContainer shiftDetails={shiftDetails} />
        </div>
      </div>
    </div>
  );
}

export default ShelterDashboard;
