// client_app/src/components/shelter/Schedule.jsx
import React, { useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ScheduleData } from "./ScheduleData.js";
import "../../styles/shelter/Schedule.css";

const localizer = dayjsLocalizer(dayjs);

// Helper to get the current week's Sunday->Saturday
function getDefaultWeekRange() {
  const startOfWeek = dayjs().startOf("week"); // Sunday-based
  const range = [];
  for (let i = 0; i < 7; i++) {
    range.push(startOfWeek.add(i, "day").toDate());
  }
  return range;
}

function Schedule() {
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const [activeShiftType, setActiveShiftType] = useState(null);
  const [currentRange, setCurrentRange] = useState(getDefaultWeekRange());
  // NEW: Track which days (midnight timestamp) have been opened already
  const [openedDays, setOpenedDays] = useState([]);

  // 1) Single shift–click logic (unchanged)
  const handleSelectStandardShift = (shiftName) => setActiveShiftType(shiftName);

  // 2) Clicking on a day in the calendar (unchanged)
  const handleSelectDay = (slotInfo) => {
    if (!activeShiftType) return;
    const standardShift = ScheduleData.Content.find(s => s.name === activeShiftType);
    if (!standardShift) return;
    const dropDate = new Date(slotInfo.start);
    dropDate.setHours(0, 0, 0, 0);
    const newShiftStart = dropDate.getTime() + standardShift.start;
    const newShiftEnd = dropDate.getTime() + standardShift.end;
    const newShift = {
      name: standardShift.name,
      start_time: newShiftStart,
      end_time: newShiftEnd,
      people: standardShift.people
    };
    setScheduledShifts(prev => [...prev, newShift]);
    setActiveShiftType(null);
  };

  // 3) Clicking "Open Shift" for a particular day => load standard shifts, but only once per day
  const handleOpenDate = (dayDate) => {
    const midnight = new Date(dayDate);
    midnight.setHours(0, 0, 0, 0);
    const dayTimestamp = midnight.getTime();
    // If this day has already been opened, do nothing.
    if (openedDays.includes(dayTimestamp)) return;
    const newShifts = ScheduleData.Content.map(shift => ({
      name: shift.name,
      start_time: dayTimestamp + shift.start,
      end_time: dayTimestamp + shift.end,
      people: shift.people
    }));
    setScheduledShifts(prev => [...prev, ...newShifts]);
    setOpenedDays(prev => [...prev, dayTimestamp]);
  };

  // 4) RBC calls this whenever user navigates or changes view
  const handleRangeChange = (range) => {
    if (Array.isArray(range) && range.length > 0) {
      setCurrentRange(range);
    }
  };

  // 5) RBC calls this when user clicks an event
  const handleSelectEvent = (event) => {
    if (event.isOpenShift) {
      handleOpenDate(event.start);
    }
  };

  // 6) Convert user-scheduled shifts into RBC events with the volunteer text
  const userEvents = scheduledShifts.map(shift => ({
    title: `${shift.name} (Needs ${shift.people} volunteers)`,
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    allDay: false
  }));

  // 7) Build "Open Shift" events for each day in currentRange, but filter out days that have already been opened.
  const openShiftEvents = currentRange
    .filter(dayDate => !openedDays.includes(new Date(dayDate).setHours(0, 0, 0, 0)))
    .map(dayDate => ({
      title: "Open Shift",
      allDay: true,
      start: new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()),
      end: new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()),
      isOpenShift: true
    }));

  // 8) Combine user events with the "Open Shift" events
  const finalEvents = [...userEvents, ...openShiftEvents];

  return (
    <div className="schedule-container">
      <h2>Set Repeatable Shifts</h2>
      <div className="shift-cards-container">
        {ScheduleData.Content.map(shift => (
          <div
            key={shift.name}
            className={
              "shift-card " +
              (activeShiftType === shift.name ? "shift-card-active" : "shift-card-inactive")
            }
            onClick={() => handleSelectStandardShift(shift.name)}
          >
            <div className="shift-name">{shift.name}</div>
            <div className="shift-time">
              {new Date(shift.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
              {new Date(shift.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={finalEvents}
          defaultView={Views.WEEK}
          className="calendar-style"
          selectable
          onSelectSlot={handleSelectDay}
          onRangeChange={handleRangeChange}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
}

export default Schedule;
