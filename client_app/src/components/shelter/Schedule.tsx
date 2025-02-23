// src/components/shelter/Schedule.tsx
import React, { useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ScheduleData } from "./ScheduleData";

const localizer = dayjsLocalizer(dayjs);

interface Shift {
  name: string;
  start_time: number;
  end_time: number;
  people: number;
}

const Schedule = () => {
  const [scheduledShifts, setScheduledShifts] = useState<Shift[]>([]);
  // The active shift type that the admin has selected for placement.
  const [activeShiftType, setActiveShiftType] = useState<string | null>(null);

  // Set the active shift when a standard shift card is clicked.
  const handleSelectStandardShift = (shiftName: string) => {
    setActiveShiftType(shiftName);
  };

  // When the admin clicks a day on the calendar, add the active shift there.
  const handleSelectDay = (slotInfo: { start: Date }) => {
    if (!activeShiftType) return;
    const standardShift = ScheduleData.Content.find(
      (s) => s.name === activeShiftType
    );
    if (!standardShift) return;

    // Compute the selected day's midnight
    const dropDate = new Date(slotInfo.start);
    dropDate.setHours(0, 0, 0, 0);
    const newShiftStart = dropDate.getTime() + standardShift.start;
    const newShiftEnd = dropDate.getTime() + standardShift.end;

    const newShift: Shift = {
      name: standardShift.name,
      start_time: newShiftStart,
      end_time: newShiftEnd,
      people: standardShift.people,
    };

    setScheduledShifts([...scheduledShifts, newShift]);
    // Clear the active selection
    setActiveShiftType(null);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Set Repeatable Shifts</h2>
      <div style={{ marginBottom: "1rem" }}>
        {ScheduleData.Content.map((shift) => (
          <div
            key={shift.name}
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              marginRight: "1rem",
              backgroundColor:
                activeShiftType === shift.name ? "#d0eaff" : "#f0f0f0",
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            onClick={() => handleSelectStandardShift(shift.name)}
          >
            {shift.name}
            <br />
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
        ))}
      </div>

      <Calendar
        localizer={localizer}
        events={scheduledShifts.map((shift) => ({
          title: shift.name,
          start: new Date(shift.start_time),
          end: new Date(shift.end_time),
        }))}
        defaultView={Views.WEEK}
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectDay}
      />
    </div>
  );
};

export default Schedule;
