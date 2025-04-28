// client_app/src/components/shelter/RepeatableShifts.js

import React, { useState } from "react";
import { useParams } from "react-router-dom";

const RepeatableShifts = () => {
  const { shelterId } = useParams(); // grab the shelterId from URL

  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    day: "",
    startTime: "",
    endTime: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift({ ...newShift, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newShift.day && newShift.startTime && newShift.endTime) {
      setShifts([...shifts, newShift]);
      setNewShift({ day: "", startTime: "", endTime: "" });
    }
  };

  const updateShift = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  const deleteShift = (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    setShifts(updatedShifts);
  };

  return (
    <div className="repeatable-shifts-page">
      <h2>Define Repeatable Shifts for Shelter {shelterId}</h2>
      {/* Add new shift form */}
      <form onSubmit={handleSubmit}>
        <label>
          Day:
          <input
            type="text"
            name="day"
            value={newShift.day}
            onChange={handleInputChange}
            placeholder="e.g., Monday"
          />
        </label>
        <br />
        <label>
          Start Time:
          <input
            type="time"
            name="startTime"
            value={newShift.startTime}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          End Time:
          <input
            type="time"
            name="endTime"
            value={newShift.endTime}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <button type="submit">Add Shift</button>
      </form>
      {/* List of shifts */}
      <div style={{ marginTop: "30px" }}>
        <h3>Current Repeatable Shifts</h3>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          shifts.map((shift, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <input
                type="text"
                value={shift.day}
                onChange={(e) => updateShift(index, "day", e.target.value)}
              />
              <input
                type="time"
                value={shift.startTime}
                onChange={(e) => updateShift(index, "startTime", e.target.value)}
              />
              <input
                type="time"
                value={shift.endTime}
                onChange={(e) => updateShift(index, "endTime", e.target.value)}
              />
              <button onClick={() => deleteShift(index)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RepeatableShifts;
