import React from "react";
import OpenRequest from "./components/shelter/OpenRequests";
import PastVolunteersContainer from "./components/shelter/PastVolunteersContainer";
import ShiftContainer from "./components/shelter/ShiftContainer";
import "./index.css";

function ShelterDashboard() {
  return (
    <div>
      <div className="shelter-dashboard">
        <div className="container-large">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "98%",
            }}>
            <h4>Open requests</h4>
            <a href="/shift-details">View all</a>
          </div>
          <OpenRequest />
        </div>
        <div className="container-medium">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "98%",
            }}>
            <h4>Today's Roster</h4>
            <a href="/shift-details">View all</a>
          </div>
          <ShiftContainer />
        </div>
        <div className="container-small">
          <h4>Contact Past Volunteers</h4>
          <PastVolunteersContainer />
        </div>
      </div>
    </div>
  );
}

export default ShelterDashboard;
