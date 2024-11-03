import React from "react";
import "../../styles/shelter/UpcomingShifts.css";

const UpcomingShifts = ({ shifts }) => {
  return (
    <div className="upcoming-shifts">
      <h2>All Upcoming Requests</h2>
      {shifts.map((dateGroup, index) => (
        <div key={index} className="date-section">
          <h3 className="date-header">{dateGroup.date}</h3>
          <div className="shift-table">
            <div className="shift-table-header">
              <span>From Time</span>
              <span>To Time</span>
              <span>Number of Volunteers Requested</span>
              <span>Actions</span>
            </div>
            {dateGroup.shifts.map((shift, i) => (
              <div key={i} className="shift-row">
                <div className="shift-time">{shift.fromTime}</div>
                <div className="shift-time">{shift.toTime}</div>
                <div className="volunteers-requested">
                  {shift.volunteersRequested}
                </div>
                <div className="actions">
                  <button>Edit Request</button>
                  <button>Cancel Request</button>
                  <button>Notify Frequent Volunteers</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};


export default UpcomingShifts;
