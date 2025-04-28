// client_app/src/components/shelter/RepeatableShifts.js

import React, { useState } from "react";

const RepeatableShifts = () => {
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call an API here to send the new repeatable shift
    console.log("Submitted shift:", { day, startTime, endTime });
  };

  return (
    <div className="repeatable-shifts-page">
      <h2>Define Repeatable Shift</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Day:
          <input type="text" value={day} onChange={(e) => setDay(e.target.value)} placeholder="e.g., Monday" />
        </label>
        <br />
        <label>
          Start Time:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <br />
        <label>
          End Time:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
        <br />
        <button type="submit">Save Shift</button>
      </form>
    </div>
  );
};

export default RepeatableShifts;
