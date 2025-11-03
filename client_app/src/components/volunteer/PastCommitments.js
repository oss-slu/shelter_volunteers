import { useState, useEffect } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
import { formatDate } from "../../formatting/FormatDateTime";
import { formatTime } from "../../formatting/FormatDateTime";
import { MobileShiftCard } from "./MobileShiftCard";
import { DesktopShiftRow } from "./DesktopShiftRow";
import Loading from "../Loading";

function compareDates(timestamp1, timestamp2) {
  const dateA = new Date(timestamp1).setHours(0, 0, 0, 0);
  const dateB = new Date(timestamp2).setHours(0, 0, 0, 0);

  if (dateA === dateB) {
    // Same day: ascending order by time
    return timestamp1 - timestamp2;
  }
  // Different days: most recent first
  return dateB - dateA;
}

function PastCommitments() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commitments = await serviceCommitmentAPI.getPastCommitments();
        const sortedCommitments = commitments.sort((a, b) =>
          compareDates(a.shift_start, b.shift_start),
        );
        setShifts(sortedCommitments);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process shift data for rendering (eliminates duplication)
  const processShiftData = (shift) => {
    const shelter = shift.shelter;
    const startDate = formatDate(shift.shift_start);
    const startTime = formatTime(shift.shift_start);
    const endTime = formatTime(shift.shift_end);
    const isSelected = false; // Past shifts are not selectable
    const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60));
    const canInteract = false;
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      isSelected,
      duration,
      canInteract,
    };
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <h1 className="title-small">Your Past Shifts</h1>
      <div className="description">
        <p className="tagline-small">Here are the shifts you have completed in the past.</p>
      </div>
      {/* Desktop Table View */}
      <div className="table-container desktop-only">
        <table className="shifts-table">
          <thead>
            <tr className="table-header">
              <th>Shelter</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <DesktopShiftRow key={shift._id} shiftData={processShiftData(shift)} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only">
        {shifts.map((shift) => (
          <MobileShiftCard key={shift._id} shiftData={processShiftData(shift)} />
        ))}
      </div>
    </div>
  );
}

export default PastCommitments;
