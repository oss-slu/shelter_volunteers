import React from "react";
import Modal from 'react-modal';

export const MoreDetailsBox = props => {
  const {isMoreDetailsModelOpen, setIsMoreDetailsModelOpen, onSignUpVolunteersClick} = props;

  return (
    <div className="modal-overlay">
      <Modal isOpen = {isMoreDetailsModelOpen} 
        onRequestClose = {() => setIsMoreDetailsModelOpen(false)}
        ariaHideApp = {false} >
        <h2>Shift Details</h2>
        <p>Start Time: 7:30 am </p>
        <p>End Time: 9:30 am </p>
        <p>Requested Volunteers: 4 </p>
        <p><button onClick={onSignUpVolunteersClick}>^</button>Signed Up Volunteers: 1 </p>
        <p>Required Volunteers: 2 </p>
        <button >Request More Volunteers</button>
        <button> Sign-up of Volunteers</button>
        <button>Close Request</button>
        <button onClick = {() => setIsMoreDetailsModelOpen(false)}>Close Modal</button>
      </Modal>
    </div>
  );
};
