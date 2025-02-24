// client_app/src/components/shelter/Schedule.jsx
import React, { useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ScheduleData } from "./ScheduleData.js"; // Ensure this file exists in the same folder
import "../../styles/shelter/Schedule.css";       // Make sure Schedule.css is in client_app/src/styles/shelter/

const localizer = dayjsLocalizer(dayjs);

// We define a helper array for Sunday–Saturday.
const WEEK_DAYS = [
  { label: "Sunday", offset: 0 },
  { label: "Monday", offset: 1 },
  { label: "Tuesday", offset: 2 },
  { label: "Wednesday", offset: 3 },
  { label: "Thursday", offset: 4 },
  { label: "Friday", offset: 5 },
  { label: "Saturday", offset: 6 },
];

const Schedule = () => {
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const [activeShiftType, setActiveShiftType] = useState(null);

  // 1. Existing logic for single shift click
  const handleSelectStandardShift = (shiftName) => {
    setActiveShiftType(shiftName);
  };

  // 2. Existing logic for clicking on a day in the calendar
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

  // 3. NEW FUNCTION: "Open" a given day of the week (Sunday–Saturday)
  //    This automatically loads all standard shifts for that day.
  const handleOpenDay = (dayOffset) => {
    // By default, we get the current week's Sunday
    // If you prefer the user to navigate the calendar and pick a Sunday from there,
    // you could do something more dynamic. For now, let's keep it simple:
    const today = new Date();
    const currentWeekSunday = dayjs(today).startOf("week").toDate();
    // (If you want Monday-based weeks, use .startOf("isoWeek"))

    // dayOffset is 0..6 for Sunday..Saturday
    const dayDate = new Date(currentWeekSunday);
    dayDate.setDate(dayDate.getDate() + dayOffset);
    dayDate.setHours(0, 0, 0, 0);

    // For each shift in ScheduleData, create a new shift object for this day.
    const newShifts = ScheduleData.Content.map((shift) => {
      return {
        name: shift.name,
        start_time: dayDate.getTime() + shift.start,
        end_time: dayDate.getTime() + shift.end,
        people: shift.people,
      };
    });

    // Add these new shifts to the scheduledShifts
    setScheduledShifts((prev) => [...prev, ...newShifts]);
  };

  return (
    <div className="schedule-container">
      <h2>Set Repeatable Shifts</h2>

      {/* SHIFT CARDS (existing logic for single-shift clicks) */}
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

      {/* NEW ROW OF "OPEN" BUTTONS FOR EACH DAY */}
      <div style={{ marginBottom: "1rem" }}>
        {WEEK_DAYS.map((dayObj) => (
          <button
            key={dayObj.label}
            onClick={() => handleOpenDay(dayObj.offset)}
            style={{ marginRight: "0.5rem" }}
          >
            Open {dayObj.label}
          </button>
        ))}
      </div>

      {/* CALENDAR (unchanged) */}
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
