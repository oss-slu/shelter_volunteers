import React from "react";
import "../../styles/shelter/UpcomingRequests.css";
import { upcomingRequestsData } from "./UpcomingRequests.tsx";

const UpcomingRequests = (props) => {
  const { onEditRequestClick, onCancelRequestClick, onNotifyVolunteersClick } = props;

  return (
    <div className="upcoming-requests">
      <h2>All Upcoming Requests</h2>
      {upcomingRequestsData.map((request, index) => (
        <div key={index} className="date-section">
          <div className="date-header">{request.date}</div>
          <div className="shift-table">
            {/* Header Row for Time and Volunteer Count */}
            <div className="shift-table-header">
              <span>From Time</span>
              <span>To Time</span>
              <span>Number of Volunteers Requested</span>
              <span></span>
            </div>
            {request.shifts.map((shift, shiftIndex) => (
              <div key={shiftIndex} className="shift-row">
                <div className="shift-time">{shift.fromTime}</div>
                <div className="shift-time">{shift.toTime}</div>
                <div className="volunteers-requested">{shift.volunteersRequested}</div>
                <div className="actions">
                  <button onClick={() => onEditRequestClick(shift)}>Edit Request</button>
                  <button onClick={() => onCancelRequestClick(shift)}>Cancel Request</button>
                  <button onClick={() => onNotifyVolunteersClick(shift)}>Notify Frequent Volunteers</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingRequests;
