import React from 'react';
import { ModalComponent } from './ModalComponent';
import "../../styles/shelter/CancelRequestModal.css";

export const CancelRequestModal = ({ isOpen, onClose, shift, onConfirmCancel }) => {
  const handleConfirm = () => {
    onConfirmCancel(shift); 
    onClose(); 
  };

  const renderData = () => {
    if (!shift) {
      return null; 
    }
    return (
      <div>
        <h3>Confirm Cancellation</h3>
        <p className="message-text">Are you sure you want to cancel the shift scheduled on {shift.date} from {shift.fromTime} to {shift.toTime}?</p>
        <div className="button-container">
          <button onClick={handleConfirm}>Yes, Cancel</button>
          <button onClick={onClose}>No, Keep</button>
        </div>
      </div>
    );
  };

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};
