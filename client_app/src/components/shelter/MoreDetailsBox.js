import React from "react";
import Modal from 'react-modal';
const MoreDetailsBox = () => {

  const [isMOpen, setIsMOpen] = React.useState(false);

  return (
    <div className="modal-overlay">
      <button onClick = {() => setIsMOpen(true)}>Open Modal</button>
      <Modal isOpen = {isMOpen} 
        onRequestClose = {() => setIsMOpen(false)}
        ariaHideApp = {false} >
        <h2>Shift Details</h2>
        <p>Start Time: 7:30 am </p>
        <p>End Time: 9:30 am </p>
        <p>Requested Volunteers: 4 </p>
        <p>Signed Up Volunteers: 1 </p>
        <p>Required Volunteers: 2 </p>
        <button >Request More Volunteers</button>
        <button> Sign-up of Volunteers</button>
        <button>Close Request</button>
        <button onClick = {() => setIsMOpen(false)}>Close Modal</button>
      </Modal>
    </div>
  );
};

export default MoreDetailsBox;