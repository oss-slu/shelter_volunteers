import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import OpenRequest from "./OpenRequests";
import PastVolunteersContainer from "./PastVolunteersContainer";
import ShiftContainer from "./ShiftContainer";
import "../../styles/index.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";
import AllVolunteers from "./AllVolunteers";
import AllTodaysShifts from "./AllTodaysShifts";
import AddUserForm from "./AddUserForm";

function ShelterDashboard() {
  const { shelterId } = useParams(); // Extract from URL param
  const [shiftDetails, setShiftDetails] = useState([]);
  const [showAllPastVolunteers, setShowAllPastVolunteers] = useState(false);
  const [showAllTodaysShifts, setShowAllTodaysShifts] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false); 

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
      {!showAllTodaysShifts && !showAllPastVolunteers && (
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
              <button
                style={{
                  backgroundColor: "#f9f6f6",
                  border: "none",
                  outline: "none",
                  color: "#1F75FE",
                  fontSize: "1.0rem",
                  textDecoration: "underline",
                  textAlign: "center",
                  padding: "0",
                  marginTop: "-5px",
                }}
                onClick={() => setShowAllTodaysShifts(true)} 
              >
                View all
              </button>
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
                  color: "#1F75FE",
                  fontSize: "1.0rem",
                  textDecoration: "underline",
                  textAlign: "center",
                  padding: "0",
                  marginTop: "-5px"
                }}
                onClick={() => setShowAllPastVolunteers(true)}
              >
                View all
              </button>
            </div>
            <PastVolunteersContainer shiftDetails={shiftDetails} />
          </div>

          {/* Existing inline AddUserForm section */}
          <div className="container-small">
            <div className="container-align">
              <h4>Settings</h4>
              <button
                style={{
                  backgroundColor: "#f9f6f6",
                  border: "none",
                  outline: "none",
                  color: "#1F75FE",
                  fontSize: "1.0rem",
                  textDecoration: "underline",
                  textAlign: "center",
                  padding: "0",
                  marginTop: "-5px"
                }}
                onClick={() => setShowAddUserForm(!showAddUserForm)}
              >
                Add or Remove Users
              </button>
            </div>
            {showAddUserForm && <AddUserForm shelterId={shelterId} />}
          </div>

          {/* ✅ Link to new Settings screen */}
          <div className="container-small">
            <div className="container-align">
              <h4>Settings</h4>
              <a href={`/shelter-dashboard/${shelterId}/settings`}>Add or Remove Users</a>
            </div>
          </div>

        </div>
      )}
      {showAllTodaysShifts && (
        <div>
          <AllTodaysShifts shiftDetails={shiftDetails} />
          <button
            style={{
              backgroundColor: "#f9f6f6",
              border: "1px solid #ccc",
              color: "#193b45",
              fontSize: "1.0rem",
              padding: "10px 20px",
              marginTop: "10px",
              borderRadius: "5px",
            }}
            onClick={() => setShowAllTodaysShifts(false)} 
          >
          </button>
        </div>
      )}
      {showAllPastVolunteers && (
        <div>
          <AllVolunteers shiftDetails={shiftDetails} />
        </div>
      )}
    </div>
  );
}

export default ShelterDashboard;