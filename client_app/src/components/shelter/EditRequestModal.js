import React, { useState, useEffect } from 'react';
import { ModalComponent } from './ModalComponent';
import { timestampToTimeInput, timeInputToTimestamp } from '../../formatting/FormatDateTime';
import "../../styles/shelter/EditRequestModal.css";


export const EditRequestModal = ({ isOpen, onClose, shift, onSave }) => {
  const MAX_INSTRUCTIONS_LENGTH = 500;
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [volunteersRequested, setVolunteersRequested] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [originalShift, setOriginalShift] = useState(null);

  useEffect(() => {
    if (shift) {
      setOriginalShift(shift);
      setFromTime(timestampToTimeInput(shift.shift_start));
      setToTime(timestampToTimeInput(shift.shift_end));
      setVolunteersRequested(shift.required_volunteer_count || 0);
      setInstructions(shift.instructions || "");
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

  const handleInstructionsChange = (e) => {
    setInstructions(e.target.value);
  };

  const handleSave = async () => {
    if (!originalShift) return;
    
    const startTimestamp = timeInputToTimestamp(fromTime, originalShift.shift_start);
    const endTimestamp = timeInputToTimestamp(toTime, originalShift.shift_end);
    
    // Validate that start time is before end time
    if (startTimestamp >= endTimestamp) {
      alert("Start time must be before end time. Please correct the time range.");
      return;
    }
    
    const updatedShift = {
      ...originalShift,
      shift_start: startTimestamp,
      shift_end: endTimestamp,
      required_volunteer_count: volunteersRequested,
      instructions: instructions.trim(),
    };
    
    await onSave(updatedShift);
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
      <div className="formField">
        <label className="fieldLabel">Instructions for Volunteers (optional)</label>
        <textarea
          value={instructions}
          onChange={handleInstructionsChange}
          className="instructionsInput"
          placeholder="Enter entry instructions, items to bring, parking info, etc."
          maxLength={MAX_INSTRUCTIONS_LENGTH}
          rows={4}
        />
        <div className="helperText">
          {instructions.trim().length}/{MAX_INSTRUCTIONS_LENGTH}
        </div>
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
