import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar } from "react-multi-date-picker";
import { DesktopShiftRow } from "./DesktopShiftRow";
import { formatDate, displayTime } from "../../formatting/FormatDateTime";
import { scheduleAPI } from "../../api/schedule";
import { serviceShiftAPI } from "../../api/serviceShift";
import Loading from "../Loading";

function ShelterScheduleManager() {
  const { shelterId } = useParams(); // Extract from URL param
  const [noSchedule, setNoSchedule] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [tentativeSchedule, setTentativeSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openDates, setOpenDates] = useState([]);
  const [shiftTemplates, setShiftTemplates] = useState([]);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Fetch existing shifts when the component mounts
    const fetchShifts = async () => {
      const shifts = await scheduleAPI.getShifts(shelterId);
      if (!shifts || shifts.length === 0) {
        setNoSchedule(true);
      } else {
        setShiftTemplates(shifts);
        const existingShifts = await serviceShiftAPI.getFutureShiftsForShelter(shelterId);
        const openDatesSet = new Set(
          existingShifts.map((shift) => {
            const date = new Date(shift.shift_start);
            date.setHours(0, 0, 0, 0);
            return date.toISOString().split("T")[0];
          }),
        );
        setOpenDates(openDatesSet);
      }
      setIsLoading(false);
    };
    fetchShifts();
  }, []);

  const processShiftData = (shiftDate, shift) => {
    const date = formatDate(shiftDate);
    return {
      ...shift,
      date,
    };
  };

  const updateShift = (id, field, value) => {
    const dateStr = id.split("|")[0];
    const index = id.split("|")[1];

    // Create a deep copy of the tentative schedule
    const updatedSchedule = { ...tentativeSchedule };
    updatedSchedule[dateStr] = {
      ...updatedSchedule[dateStr],
      shifts: updatedSchedule[dateStr].shifts.map((shift, i) =>
        i === parseInt(index) ? { ...shift, [field]: value } : shift,
      ),
    };
    setTentativeSchedule(updatedSchedule);
  };

  const deleteShift = (id) => {
    const dateStr = id.split("|")[0];
    const index = parseInt(id.split("|")[1], 10);
    const updatedSchedule = { ...tentativeSchedule };
    if (updatedSchedule[dateStr]) {
      updatedSchedule[dateStr].shifts = updatedSchedule[dateStr].shifts.filter(
        (_, i) => i !== index,
      );
      if (updatedSchedule[dateStr].shifts.length === 0) {
        setSelectedDates(
          selectedDates.filter((dateObj) => {
            const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
            const formatted = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return formatted !== dateStr;
          }),
        );
        delete updatedSchedule[dateStr];
      }
    }
    setTentativeSchedule(updatedSchedule);
  };

  const generateTentativeSchedule = (dates) => {
    const schedule = {};

    if (!dates || dates.length === 0) return schedule;

    dates.forEach((dateObj) => {
      const dateStr = formatDate(dateObj);
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);

      schedule[dateStr] = {
        date: dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        shifts: shiftTemplates.map((shift, index) => ({
          requiredVolunteers: shift.required_volunteer_count,
          maxVolunteers: shift.max_volunteer_count,
          startTime: displayTime(shift.shift_start, true),
          endTime: displayTime(shift.shift_end, true),
          duration: (shift.shift_end - shift.shift_start) / (1000 * 60 * 60), // Convert milliseconds to hours
          shiftName: shift.shift_name,
          id: `${index}`,
          date: dateStr,
          assignedVolunteers: 0,
        })),
      };
    });
    // Ensure schedule keys are sorted by date string (ascending)
    // This does not mutate the object, but you can use this pattern when mapping:
    return schedule;
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates || []);
  };

  useEffect(() => {
    setTentativeSchedule(generateTentativeSchedule(selectedDates));
  }, [selectedDates]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const shiftsToCreate = [];

    Object.entries(tentativeSchedule).forEach(([dateStr, { shifts }]) => {
      shifts.forEach((shift) => {
        // Combine date and startTime to get shift_start in ms since epoch
        const [startHour, startMinute] = shift.startTime.split(":").map(Number);
        const shiftDate = new Date(dateStr);
        shiftDate.setHours(startHour, startMinute, 0, 0);
        const shift_start = shiftDate.getTime();

        // Duration is in hours, convert to ms and add to shift_start
        const shift_end = shift_start + shift.duration * 60 * 60 * 1000;

        console.log(shift);
        shiftsToCreate.push({
          shift_start,
          shift_end,
          shelter_id: shelterId,
          required_volunteer_count: shift.requiredVolunteers,
          max_volunteer_count: shift.maxVolunteers,
          shift_name: shift.shiftName,
        });
      });
    });

    try {
      await serviceShiftAPI.addShifts(shelterId, shiftsToCreate);

      setSubmitMessage({
        type: "success",
        text: `shifts created successfully`,
      });

      setOpenDates((prev) => {
        const newDates = new Set(prev);
        selectedDates.forEach((dateObj) => {
          const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
          date.setHours(0, 0, 0, 0);
          newDates.add(date.toISOString().split("T")[0]);
        });
        return newDates;
      });

      setSelectedDates([]);
    } catch (error) {
      console.error("Error creating shifts:", error);
      setSubmitMessage({
        type: "error",
        text: `Failed to create shifts: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isLoading) {
    return <Loading />;
  }

  if (noSchedule) {
    return (
      <div className="title-small">
        Please define a{" "}
        <a href={`/shelter-dashboard/${shelterId}/repeatable-shifts`} className="link">
          daily schedule
        </a>{" "}
        first.
      </div>
    );
  }
  return (
    <div className="has-sticky-bottom">
      <h1 className="title-small">Select Dates To Open Shelter</h1>
      <div>
        {submitMessage.text && (
          <div className={`message ${submitMessage.type}`}>{submitMessage.text}</div>
        )}
        <div className="calendar-container">
          <Calendar
            multiple
            onlyShowInRangeDates={true}
            minDate={today}
            value={selectedDates}
            onChange={handleDateChange}
            mapDays={({ date }) => {
              const dateStr = date.format("YYYY-MM-DD");
              if (openDates.size > 0 && openDates.has(dateStr)) {
                return {
                  disabled: true,
                  style: { backgroundColor: "green", color: "#bbb" },
                  title: "Shelter is already open on this date",
                };
              }
            }}
          />
        </div>
        {/* Schedule Preview Section */}
        {Object.keys(tentativeSchedule).length > 0 && (
          <div className="table-container desktop-only">
            <table className="shifts-table">
              <thead>
                <tr className="table-header">
                  <th>Date</th>
                  <th>Shift Name</th>
                  <th>Start Time</th>
                  <th>Duration</th>
                  <th>End Time</th>
                  <th>Required Volunteers</th>
                  <th>Max Volunteers</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tentativeSchedule)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([shiftDate, shifts]) =>
                    shifts.shifts.map((shift, index) => (
                      <DesktopShiftRow
                        key={shift.id}
                        index={shiftDate + "|" + index}
                        shift={processShiftData(shiftDate, shift)}
                        updateShift={updateShift}
                        deleteShift={deleteShift}
                      />
                    )),
                  )}
              </tbody>
            </table>
          </div>
        )}
        {/* Summary and Actions */}
        <div className="sticky-signup-container">
          <div className="signup-section">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(tentativeSchedule).length === 0}
              className={`signup-button ${Object.keys(tentativeSchedule).length > 0 ? "enabled" : "disabled"}`}>
              Create Shifts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShelterScheduleManager;
