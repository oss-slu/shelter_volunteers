// client_app/src/components/shelter/RepeatableShifts.js

import React, { useState } from "react";
import { useParams } from "react-router-dom";

const RepeatableShifts = () => {
  const { shelterId } = useParams();

  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    shift_name: "",
    shift_start: "",
    shift_end: "",
    required_volunteer_count: 1,
    max_volunteer_count: 5
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift({ ...newShift, [name]: value });
  };

  const timeToMilliseconds = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newShift.shift_start && newShift.shift_end) {
      const formattedShift = {
        shift_name: newShift.shift_name,
        shift_start: timeToMilliseconds(newShift.shift_start),
        shift_end: timeToMilliseconds(newShift.shift_end),
        required_volunteer_count: Number(newShift.required_volunteer_count) || 1,
        max_volunteer_count: Number(newShift.max_volunteer_count) || 5
      };
      setShifts([...shifts, formattedShift]);
      setNewShift({
        shift_name: "",
        shift_start: "",
        shift_end: "",
        required_volunteer_count: 1,
        max_volunteer_count: 5
      });
    }
  };

  const updateShift = (index, field, value) => {
    const updatedShifts = [...shifts];
    if (field === "shift_start" || field === "shift_end") {
      updatedShifts[index][field] = timeToMilliseconds(value);
    } else if (field === "required_volunteer_count" || field === "max_volunteer_count") {
      updatedShifts[index][field] = Number(value);
    } else {
      updatedShifts[index][field] = value;
    }
    setShifts(updatedShifts);
  };

  const deleteShift = (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    setShifts(updatedShifts);
  };

  const millisecondsToTime = (ms) => {
    const totalMinutes = ms / (60 * 1000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  return (
    <div className="repeatable-shifts-page" style={{ padding: "20px" }}>
      <h2>Define Repeatable Shifts for Shelter {shelterId}</h2>
      {/* Add New Shift Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <label>
          Shift Name (optional):
          <input
            type="text"
            name="shift_name"
            value={newShift.shift_name}
            onChange={handleInputChange}
            placeholder="e.g., Morning Shift"
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </label>
        <br />
        <label>
          Start Time:
          <input
            type="time"
            name="shift_start"
            value={newShift.shift_start}
            onChange={handleInputChange}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </label>
        <br />
        <label>
          End Time:
          <input
            type="time"
            name="shift_end"
            value={newShift.shift_end}
            onChange={handleInputChange}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </label>
        <br />
        <label>
          Required Volunteers:
          <input
            type="number"
            name="required_volunteer_count"
            value={newShift.required_volunteer_count}
            onChange={handleInputChange}
            min="1"
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </label>
        <br />
        <label>
          Max Volunteers:
          <input
            type="number"
            name="max_volunteer_count"
            value={newShift.max_volunteer_count}
            onChange={handleInputChange}
            min="1"
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </label>
        <br />
        <button type="submit">Add Shift</button>
      </form>
      {/* Current Repeatable Shifts */}
      <h3>Current Repeatable Shifts</h3>
      {shifts.length === 0 ? (
        <p>No shifts added yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
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
                    value={shift.shift_name}
                    onChange={(e) => updateShift(index, "shift_name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    onChange={(e) => updateShift(index, "shift_start", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    onChange={(e) => updateShift(index, "shift_end", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={shift.required_volunteer_count}
                    onChange={(e) => updateShift(index, "required_volunteer_count", e.target.value)}
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={shift.max_volunteer_count}
                    onChange={(e) => updateShift(index, "max_volunteer_count", e.target.value)}
                    min="1"
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
  );
};

export default RepeatableShifts;
