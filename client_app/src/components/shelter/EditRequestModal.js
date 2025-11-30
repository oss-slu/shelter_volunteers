import React, { useState, useEffect } from 'react';
import { ModalComponent } from './ModalComponent';
import { timestampToTimeInput, timeInputToTimestamp } from '../../formatting/FormatDateTime';
import "../../styles/shelter/EditRequestModal.css";


export const EditRequestModal = ({ isOpen, onClose, shift, onSave }) => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [volunteersRequested, setVolunteersRequested] = useState(0);
  const [originalShift, setOriginalShift] = useState(null);

  useEffect(() => {
    if (shift) {
      setOriginalShift(shift);
      setFromTime(timestampToTimeInput(shift.shift_start));
      setToTime(timestampToTimeInput(shift.shift_end));
      setVolunteersRequested(shift.required_volunteer_count || 0);
    }
  }, [shift]);

  const handleFromTimeChange = (e) => {
    setFromTime(e.target.value);
  };

  const handleToTimeChange = (e) => {
    setToTime(e.target.value);
  };

  const handleVolunteersChange = (e) => {
    setVolunteersRequested(parseInt(e.target.value, 10) || 0);
  };

  const handleSave = () => {
    if (!originalShift) return;
    
    const updatedShift = {
      ...originalShift,
      shift_start: timeInputToTimestamp(fromTime, originalShift.shift_start),
      shift_end: timeInputToTimestamp(toTime, originalShift.shift_end),
      required_volunteer_count: volunteersRequested
    };
    
    onSave(updatedShift);
    onClose();
  };

  const renderData = () => (
    <div className="modalEditRequest">
      <h3 className="editShiftHeader">Edit Shift</h3>
      <div className="formField">
        <label className="fieldLabel">From Time:</label>
        <input
          type="time"
          value={fromTime}
          onChange={handleFromTimeChange}
          className="timeInput"
        />
      </div>
      <div className="formField">
        <label className="fieldLabel">To Time:</label>
        <input
          type="time"
          value={toTime}
          onChange={handleToTimeChange}
          className="timeInput"
        />
      </div>
      <div className="formField">
        <label className="fieldLabel">Volunteers Requested:</label>
        <input
          type="number"
          min="0"
          value={volunteersRequested}
          onChange={handleVolunteersChange}
          className="numberInput"
        />
      </div>
      <div className="buttonContainer">
        <button className="saveButton" onClick={handleSave}>Save</button>
        <button className="cancelButton" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};