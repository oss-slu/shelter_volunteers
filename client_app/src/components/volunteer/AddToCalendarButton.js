import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  CALENDAR_EXPORT_NOTICE,
  downloadShiftCalendar,
  hasValidShiftTimes,
} from "../../utils/shiftCalendar";
import "../../styles/volunteer/AddToCalendar.css";

export default function AddToCalendarButton({ shift }) {
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const available =
    hasValidShiftTimes(shift) &&
    Boolean(shift?.service_shift_id || shift?._id) &&
    shift.shift_start > Date.now();

  const handleDownload = (event) => {
    event.stopPropagation();
    setMessage("");
    setFailed(false);
    try {
      if (!available || shift.shift_start <= Date.now()) {
        throw new Error("Only upcoming shifts with valid times can be exported.");
      }
      downloadShiftCalendar(shift);
      setMessage(
        "Calendar download started. Open the .ics file to import this shift into your calendar.",
      );
    } catch (error) {
      setFailed(true);
      setMessage("Could not download this shift. Please try again or refresh the page.");
    }
  };

  return (
    <div className="shift-calendar-export">
      <button
        type="button"
        className="shift-calendar-export__button"
        onClick={handleDownload}
        disabled={!available}
        aria-label={`Add ${shift.shift_name || "shift"} to calendar`}>
        <CalendarPlus size={18} aria-hidden="true" />
        Add to Calendar
      </button>
      <p className="shift-calendar-export__note">{CALENDAR_EXPORT_NOTICE}</p>
      {!available && (
        <p className="shift-calendar-export__note">
          Calendar export is unavailable for this shift.
        </p>
      )}
      {message && (
        <p className="shift-calendar-export__message" role={failed ? "alert" : "status"}>
          {message}
        </p>
      )}
    </div>
  );
}
