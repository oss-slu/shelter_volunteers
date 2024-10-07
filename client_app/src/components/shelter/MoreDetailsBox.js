import React, { useState } from "react";
import Modal from 'react-modal';
import "../../styles/shelter/MoreDetailsBox.css";

export const MoreDetailsBox = (props) => {
  const { isMModalOpen, setIsMModalOpen } = props;

  // State to toggle the signed-up volunteer details
  const [isVolunteersOpen, setIsVolunteersOpen] = useState(false);

  // Function to toggle volunteer information
  const onSignUpVolunteersClick = () => {
    setIsVolunteersOpen(!isVolunteersOpen); // Toggle the state
  };

  return (
    <div className="modal-overlay">
      <Modal 
        isOpen={isMModalOpen} 
        onRequestClose={() => setIsMModalOpen(false)} 
        ariaHideApp={false}>
        <div className="modal-content">
          <h2>Shift Details</h2>
          <div className="shift-details-box">
            <div className="shift-detail-row">
              <p className="shift-detail-label">Shift Start Time:</p>
              <p className="shift-detail-value">12:00 AM</p>
            </div>
            <div className="shift-detail-row">
              <p className="shift-detail-label">Shift End Time:</p>
              <p className="shift-detail-value">4:00 PM</p>
            </div>
            <div className="shift-detail-row">
              <p className="shift-detail-label">Requested Volunteers:</p>
              <p className="shift-detail-value">30</p>
            </div>
            <div className="shift-detail-row">
              <p className="shift-detail-label">Signed Up Volunteers:</p>
              <div className="signed-up-volunteers">
                {/* Toggle button to show/hide volunteer details */}
                <button className="arrow" onClick={onSignUpVolunteersClick}>
                  {isVolunteersOpen ? "▼" : "►"} {/* Arrow direction changes */}
                </button>
                <p className="shift-detail-value">2</p>
              </div>
            </div>
            {isVolunteersOpen && (
              <div className="shift-volunteer-info">
                <p>Volunteer 1: John Doe</p>
                <p>Volunteer 2: Jane Smith</p>
                {/* Add any other volunteer details here */}
              </div>
            )}
            <div className="shift-detail-row">
              <p className="shift-detail-label">Required Volunteers:</p>
              <p className="shift-detail-value">10</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="action-btn">Request More Volunteers</button>
            <button className="action-btn">Close Sign-up of Volunteers</button>
            <button className="action-btn">Close Request</button>
            <button className="action-btn" onClick={() => setIsMModalOpen(false)}>Close Modal</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
