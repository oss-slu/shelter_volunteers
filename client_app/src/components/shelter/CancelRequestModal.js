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
    const formattedStartTime = new Date(
      shift.shift_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedEndTime = new Date(
      shift.shift_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = new Date(
      shift.shift_start).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      
    return (
      <div>
        <h3>Confirm Cancellation</h3>
        <p className="message-text">Are you sure you want to cancel the shift scheduled on {formattedDate} from {formattedStartTime} to {formattedEndTime}?</p>
        <div className="button-container">
          <button className="confirmationButton" onClick={handleConfirm}>Yes, Cancel</button>
          <button className="cancellationButton" onClick={onClose}>No, Keep</button>
        </div>
      </div>
    );
  };

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};
