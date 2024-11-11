import React from 'react';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import "../../styles/shelter/TodayShifts.css"; 
import { format, isSameDay } from "date-fns";

const TodayShifts = ({ shiftDetails }) => {
    const today = new Date();

    //filtereing shifts here
    const todayShifts = shiftDetails.filter(shift =>
        isSameDay(new Date(shift.start_time), today)
    );

    return (
      <div className="today-shifts-container">
        {todayShifts.length > 0 ? (
          todayShifts.map((shift, index) => (
            <div key={index} className="shift-item-container">
              <div className="shift-item">
                <AccountCircleIcon />
                <span>
                  {format(new Date(shift.start_time), "hh:mm aaaa")} - {format(new Date(shift.end_time), "hh:mm aaaa")}
                </span>
                <NotificationsNoneIcon />
              </div>
              <div className="volunteers-list">
                {shift.worker ? (
                  shift.worker.split(", ").map((name, i) => (
                    <span key={i} className="volunteer-name">
                      {name}
                    </span>
                  ))
                ) : (
                  <span>No volunteers assigned.</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <span>No shifts available for today.</span>
        )}
      </div>
    );
}

export default TodayShifts;
