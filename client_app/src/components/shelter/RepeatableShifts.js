// client_app/src/components/shelter/RepeatableShifts.js

import React, { useState } from "react";
import { useParams } from "react-router-dom";

const RepeatableShifts = () => {
  const { shelterId } = useParams(); // grab the shelterId from URL

  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    requiredVolunteers: 1,
    maxVolunteers: 5,
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Convert HH:MM to milliseconds since midnight
  const timeStringToMillis = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift({ ...newShift, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newShift.startTime && newShift.endTime) {
      const newEntry = {
        ...newShift,
        shift_start: timeStringToMillis(newShift.startTime),
        shift_end: timeStringToMillis(newShift.endTime),
      };
      setShifts([...shifts, newEntry]);
      setNewShift({
        shiftName: "",
        startTime: "",
        endTime: "",
        requiredVolunteers: 1,
        maxVolunteers: 5,
      });
      setSuccessMessage("Shift added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000); // Remove after 3 sec
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
    <div className="repeatable-shifts-page" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2>Define Repeatable Shifts for Shelter {shelterId}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Shift Name (optional):
          <input
            type="text"
            name="shiftName"
            value={newShift.shiftName}
            onChange={handleInputChange}
            placeholder="e.g., Morning Shift"
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
        <label>
          Required Volunteers:
          <input
            type="number"
            name="requiredVolunteers"
            value={newShift.requiredVolunteers}
            onChange={handleInputChange}
            min="1"
          />
        </label>
        <br />
        <label>
          Max Volunteers:
          <input
            type="number"
            name="maxVolunteers"
            value={newShift.maxVolunteers}
            onChange={handleInputChange}
            min="1"
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: "10px" }}>
          Add Shift
        </button>
        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
      </form>

      {/* List of shifts */}
      <div>
        <h3>Current Repeatable Shifts</h3>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Shift Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Required Volunteers</th>
                <th>Max Volunteers</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={shift.shiftName}
                      onChange={(e) => updateShift(index, "shiftName", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => updateShift(index, "startTime", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => updateShift(index, "endTime", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={shift.requiredVolunteers}
                      onChange={(e) => updateShift(index, "requiredVolunteers", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={shift.maxVolunteers}
                      onChange={(e) => updateShift(index, "maxVolunteers", e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteShift(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RepeatableShifts;
