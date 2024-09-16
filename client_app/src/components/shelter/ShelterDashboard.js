//import React from "react";
import React, { useState } from "react";
import OpenRequest from "./OpenRequests";
import PastVolunteersContainer from "./PastVolunteersContainer";
import ShiftContainer from "./ShiftContainer";
import "../../styles/index.css";
import ShiftDetailsModal from "./ShiftDetailsModal";


function ShelterDashboard() {
  const [selectedShift, setSelectedShift] = useState(null); // For selected shift details
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility

  // Handle opening modal and setting shift details
  const handleMoreDetailsClick = (shift) => {
    setSelectedShift(shift); // Pass shift data
    setIsModalOpen(true); // Open modal
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null); // Reset selected shift
  };
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
          <OpenRequest onMoreDetailsClick={handleMoreDetailsClick} />
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
          <ShiftContainer onMoreDetailsClick={handleMoreDetailsClick} />
        </div>
        <div className="container-small">
          <h4>Contact Past Volunteers</h4>
          <PastVolunteersContainer />
        </div>
      </div>
      {/* Modal Component */}
      {isModalOpen && <ShiftDetailsModal shift={selectedShift} onClose={handleCloseModal} />}
    </div>
  );
}

export default ShelterDashboard;
