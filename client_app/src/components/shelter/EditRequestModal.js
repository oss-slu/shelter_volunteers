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
    <div className="modalEditRequest">
      <h3 className="editShiftHeader">Edit Shift</h3>
      <label className="fromLabel">
        From Time:
        <input
          type="text"
          name="fromTime"
          value={updatedShift.fromTime}
          onChange={handleChange}
          className="shiftTime"
        />
      </label>
      <label className="toLabel">
        To Time:
        <input
          type="text"
          name="toTime"
          value={updatedShift.toTime}
          onChange={handleChange}
        />
      </label>
      <label className="volunteersRequestedLabel">
        Volunteers Requested:
        <input
          type="number"
          name="volunteersRequested"
          value={updatedShift.volunteersRequested}
          onChange={handleChange}
        />
      </label>
      <button className="saveButton" onClick={handleSave}>Save</button>
      <button className="cancelButton" onClick={onClose}>Cancel</button>
    </div>
  );

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};