import React, { useState } from 'react';
import { ModalComponent } from './ModalComponent';
import "../../styles/shelter/NotifyFrequentVolunteersModal.css"; // Make sure to create and adjust this CSS file as needed

export const NotifyVolunteersModal = ({ isOpen, onClose, onNotify }) => {
  const [customMessage, setCustomMessage] = useState("");

  const handleNotify = () => {
    onNotify(customMessage); // Call the onNotify function with the message
    onClose(); // Close the modal after notifying
  };

  const renderData = () => (
    <div>
      <h3>Notify Frequent Volunteers</h3>
      <p className="message-text">Enter a custom message to send to frequent volunteers:</p>
      <textarea
        className="custom-message-input"
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <div className="button-container">
        <button onClick={handleNotify}>Send Notification</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};
