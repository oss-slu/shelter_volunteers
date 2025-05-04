import { shiftDetailsData } from "./ShiftDetailsData.tsx";
import ViewShifts from "./ViewShifts.js";
import "../../styles/shelter/UpcomingShifts.css";

const UpcomingShifts = () => {
  return (
    <div className="upcoming-shifts">
      <h2>Upcoming Shifts</h2>
      <ViewShifts shiftDetailsData={shiftDetailsData} />
    </div>
  );
}

export default UpcomingShifts;