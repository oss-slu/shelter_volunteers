import React from "react";

const ShiftDetailsModal = ({ shift, onClose, onRequestMoreVolunteers, onCloseSignups, onCloseRequest }) => {
  if (!shift) return null;

  const requiredVolunteers = shift.requestedVolunteers - shift.signedUpVolunteers;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Shift Details</h2>
        <p>Start Time: {shift.startTime}</p>
        <p>End Time: {shift.endTime}</p>
        <p>Requested Volunteers: {shift.requestedVolunteers}</p>
        <p>Signed Up Volunteers: {shift.signedUpVolunteers}</p>
        <p>Required Volunteers: {requiredVolunteers}</p>
        <button onClick={onRequestMoreVolunteers}>Request More Volunteers</button>
        <button onClick={onCloseSignups}>Close Sign-up of Volunteers</button>
        <button onClick={onCloseRequest}>Close Request</button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    </div>
  );
};

export default ShiftDetailsModal;

