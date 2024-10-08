import React from "react";
import Modal from 'react-modal';
import "../../styles/shelter/MoreDetailsBox.css";

export const MoreDetailsBox = (props) => {
  const { isMoreDetailsModelOpen, setIsMoreDetailsModelOpen, onSignUpVolunteersClick, isModalOpen } = props;

  return (
    <div className="modal-overlay">
      <Modal 
        isOpen={isMoreDetailsModelOpen} 
        onRequestClose={() => setIsMoreDetailsModelOpen(false)} 
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
              <div className="signed-up-volunteers-label">
                <p className="shift-detail-label">Signed Up Volunteers:</p>
                <button className="arrow" onClick={onSignUpVolunteersClick}>
                  {isModalOpen ? "▲" : "▼"} 
                </button>
              </div>
              <p className="shift-detail-value">2</p>
            </div>
            <div className="shift-detail-row">
              <p className="shift-detail-label">Required Volunteers:</p>
              <p className="shift-detail-value">11</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="action-btn">Request More Volunteers</button>
            <button className="action-btn">Close Sign-up of Volunteers</button>
            <button className="action-btn">Close Request</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
