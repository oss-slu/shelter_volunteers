// client_app/src/components/shelter/Schedule.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/shelter/Schedule.css";
import { serviceShiftAPI } from "../../api/serviceShift";
import { scheduleAPI } from "../../api/schedule";
import { useParams } from "react-router-dom";
import { displayTime } from "../../formatting/FormatDateTime";

const localizer = dayjsLocalizer(dayjs);

// Helper to get the current weeks Sunday->Saturday
function getDefaultWeekRange() {
  const startOfWeek = dayjs().startOf("week"); // Sunday-based
  const range = [];
  for (let i = 0; i < 7; i++) {
    range.push(startOfWeek.add(i, "day").toDate());
  }
  return range;
}

function Schedule() {
  const { shelterId } = useParams();
  
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const [activeShiftType, setActiveShiftType] = useState(null);
  const [currentRange, setCurrentRange] = useState(getDefaultWeekRange());
  const [openedDays, setOpenedDays] = useState(new Set());
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setIsLoading(true);
        // Get the shelter ID from URL params or use a default
        const id = shelterId
        
        if (!id) {
          setError("No shelter ID provided");
          setIsLoading(false);
          return;
        }
        
        const data = await scheduleAPI.getShifts(id);
        
        // Transform API data to match the expected format
        const transformedData = data.map(shift => ({
            name: shift.shift_name,
            start: shift.shift_start,
            end: shift.shift_end,
            people: shift.required_volunteer_count
          }));        
        setScheduleData(transformedData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching schedule data:", err);
        setError("Failed to load schedule data");
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, [shelterId]);

  // 1. Single shift click logic
  const handleSelectStandardShift = (shiftName) => setActiveShiftType(shiftName);

  // 2. Clicking on a day in the calendar
  const handleSelectDay = (slotInfo) => {
    if (!activeShiftType) return;
    const standardShift = scheduleData.Content.find(s => s.name === activeShiftType);
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

  // 3. Clicking "Open Shift" for a particular day => load standard shifts, but only once per day
  const handleOpenDate = (dayDate) => {
    const midnight = new Date(dayDate);
    midnight.setHours(0, 0, 0, 0);
    const dayTimestamp = midnight.getTime();
    const updatedDays = new Set(openedDays);
  
    if (openedDays.has(dayTimestamp)) {
      // TOGGLE OFF: remove shifts for this day
      setScheduledShifts(prev =>
        prev.filter(shift => {
          const shiftDate = new Date(shift.start_time);
          shiftDate.setHours(0, 0, 0, 0);
          return shiftDate.getTime() !== dayTimestamp;
        })
      );
      updatedDays.delete(dayTimestamp);
    } else {
      // TOGGLE ON: add shifts for this day
      const newShifts = scheduleData.map(shift => ({
        name: shift.name,
        start_time: dayTimestamp + shift.start,
        end_time: dayTimestamp + shift.end,
        people: shift.people,
      }));
      setScheduledShifts(prev => [...prev, ...newShifts]);
      updatedDays.add(dayTimestamp);
    }
  
    setOpenedDays(updatedDays);
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
  const openShiftEvents = currentRange.map(dayDate => {
    const ts = new Date(dayDate).setHours(0, 0, 0, 0);
    const isOpened = openedDays.has(ts);
  
    return {
      title: isOpened ? "Cancel Shift" : "Open Shift",
      allDay: true,
      start: new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()),
      end: new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()),
      isOpenShift: true,
      timestamp: ts, // used for toggling logic
    };
  });
  

  // 8) Combine user events with the "Open Shift" events
  const finalEvents = [...userEvents, ...openShiftEvents];

  const handleConfirmShifts = async () => {
    const payload = scheduledShifts.map(shift => ({
      shift_name: shift.name,
      shift_start: shift.start_time,       //changing back for now
      shift_end: shift.end_time,           //changing back for now
      required_volunteer_count: shift.people,
      shelter_id: shelterId 
    }));    

 // Log the payload to confirm structure
 console.log("Sending payload:", JSON.stringify(payload, null, 2));
    try {
      await serviceShiftAPI.addShifts(payload);
      alert("Shifts successfully created!");
    } catch (error) {
      console.log("Error when creating shifts:", error);
      alert("Issue when creating shifts.");
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="schedule-container">
        <h2>Set Repeatable Shifts</h2>
        <div>Loading schedule data...</div>
      </div>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <div className="schedule-container">
        <h2>Set Repeatable Shifts</h2>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <h2>Set Repeatable Shifts</h2>
      <div className="shift-cards-container">
        {scheduleData.map(shift => (
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
              {displayTime(shift.start)} - {" "}
              {displayTime(shift.end)}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleConfirmShifts}
        disabled={scheduledShifts.length === 0}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          fontSize: "17px",
          padding: "8px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: scheduledShifts.length === 0 ? "not-allowed" : "pointer",
          opacity: scheduledShifts.length === 0 ? 0.6 : 1,
          margin: "10px 0",
          width: "fit-content",
          maxWidth: "220px",
        }}
      >
        Confirm Shifts
      </button>
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