import React from 'react';
//import AccountCircleIcon from "@mui/icons-material/AccountCircle";
//import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import "../../styles/shelter/TodaysShifts.css"; 
//import { format, isSameDay } from "date-fns";

const TodayShifts = ({ shiftDetails }) => {
  const today = new Date();

  const todayShifts = shiftDetails.filter(shift =>
    new Date(shift.start_time).toDateString() === today.toDateString()
  );

  return (
    <div className="today-shifts-container">
      {todayShifts.length > 0 ? (
        <table className="shifts-table">
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Volunteers</th>
            </tr>
          </thead>
          <tbody>
            {todayShifts.map((shift, index) => (
              <tr key={index}>
                <td>{shift.name || "No Name"}</td>
                <td>{new Date(shift.start_time).toLocaleTimeString()}</td>
                <td>{new Date(shift.end_time).toLocaleTimeString()}</td>
                <td>{shift.worker || "No Volunteers"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No shifts available for today.</p>
      )}
    </div>
  );
};

export default TodayShifts;

