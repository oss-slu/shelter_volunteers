
// client_app/src/components/shelter/Schedule.jsx
import React, { useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ScheduleData } from "./ScheduleData.js"; // Ensure this file exists in the same folder
import "../../styles/shelter/Schedule.css";       // Make sure Schedule.css is in client_app/src/styles/shelter/

const localizer = dayjsLocalizer(dayjs);

const Schedule = () => {
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const [activeShiftType, setActiveShiftType] = useState(null);

  const handleSelectStandardShift = (shiftName) => {
    setActiveShiftType(shiftName);
  };

  const handleSelectDay = (slotInfo) => {
    if (!activeShiftType) return;
    const standardShift = ScheduleData.Content.find(
      (s) => s.name === activeShiftType
    );
    if (!standardShift) return;

    const dropDate = new Date(slotInfo.start);
    dropDate.setHours(0, 0, 0, 0);
    const newShiftStart = dropDate.getTime() + standardShift.start;
    const newShiftEnd = dropDate.getTime() + standardShift.end;

    const newShift = {
      name: standardShift.name,
      start_time: newShiftStart,
      end_time: newShiftEnd,
      people: standardShift.people,
    };

    setScheduledShifts([...scheduledShifts, newShift]);
    setActiveShiftType(null);
  };

  return (
    <div className="schedule-container">
      <h2>Set Repeatable Shifts</h2>
      <div className="shift-cards-container">
        {ScheduleData.Content.map((shift) => {
          return (
            <div
              key={shift.name}
              className={
                "shift-card " +
                (activeShiftType === shift.name
                  ? "shift-card-active"
                  : "shift-card-inactive")
              }
              onClick={() => handleSelectStandardShift(shift.name)}
            >
              <div className="shift-name">{shift.name}</div>
              <div className="shift-time">
                {new Date(shift.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(shift.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={scheduledShifts.map((shift) => {
            return {
              title: shift.name,
              start: new Date(shift.start_time),
              end: new Date(shift.end_time),
            };
          })}
          defaultView={Views.WEEK}
          className="calendar-style"
          selectable
          onSelectSlot={handleSelectDay}
        />
      </div>
    </div>
  );
};

export default Schedule;