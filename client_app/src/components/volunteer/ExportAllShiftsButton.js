import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  CALENDAR_EXPORT_NOTICE,
  downloadShiftsCalendar,
  getExportableShifts,
} from "../../utils/shiftCalendar";
import "../../styles/volunteer/AddToCalendar.css";

export default function ExportAllShiftsButton({ shifts }) {
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const count = getExportableShifts(shifts).length;

  const handleDownload = () => {
    setMessage("");
    setFailed(false);
    try {
      downloadShiftsCalendar(shifts);
      setMessage(
        `Calendar download started with ${count} shift${count === 1 ? "" : "s"}. Open the .ics file to import them.`,
      );
    } catch (error) {
      setFailed(true);
      setMessage("Could not download your upcoming shifts. Please try again or refresh the page.");
    }
  };

  return (
    <div className="shift-calendar-export shift-calendar-export--all">
      <button
        type="button"
        className="shift-calendar-export__button"
        onClick={handleDownload}
        disabled={count === 0}>
        <CalendarPlus size={18} aria-hidden="true" />
        Export all upcoming shifts ({count})
      </button>
      <p className="shift-calendar-export__note">
        {count === 0
          ? "No confirmed upcoming shifts are available to export."
          : CALENDAR_EXPORT_NOTICE}
      </p>
      {message && (
        <p className="shift-calendar-export__message" role={failed ? "alert" : "status"}>
          {message}
        </p>
      )}
    </div>
  );
}
