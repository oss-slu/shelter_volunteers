import React, { useState, useEffect } from 'react';
import { ModalComponent } from './ModalComponent';
import "../../styles/shelter/EditRequestModal.css";


export const EditRequestModal = ({ isOpen, onClose, shift, onSave }) => {
  const [updatedShift, setUpdatedShift] = useState(shift || { fromTime: "", toTime: "", volunteersRequested: 0 });

  useEffect(() => {
    if (shift) {
      setUpdatedShift(shift);
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedShift((prevShift) => ({ ...prevShift, [name]: value }));
  };

  const handleSave = () => {
    onSave(updatedShift);
    onClose();
  };

  const renderData = () => (
    <div>
      <h3>Edit Shift</h3>
      <label>
        From Time:
        <input
          type="text"
          name="fromTime"
          value={updatedShift.fromTime}
          onChange={handleChange}
        />
      </label>
      <label>
        To Time:
        <input
          type="text"
          name="toTime"
          value={updatedShift.toTime}
          onChange={handleChange}
        />
      </label>
      <label>
        Volunteers Requested:
        <input
          type="number"
          name="volunteersRequested"
          value={updatedShift.volunteersRequested}
          onChange={handleChange}
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};