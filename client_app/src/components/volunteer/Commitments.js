import { useState, useEffect, useMemo, useCallback } from "react";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
import { formatDate } from "../../formatting/FormatDateTime";
import { formatTime } from "../../formatting/FormatDateTime";
import { MobileShiftCard } from "./MobileShiftCard";
import { DesktopShiftRow } from "./DesktopShiftRow";
import { SubmitResultsMessage } from "./SubmitResultsMessage";
import VolunteerShiftCalendar from "./VolunteerShiftCalendar";
import ExportAllShiftsButton from "./ExportAllShiftsButton";
import Loading from "../Loading";
import { CalendarDays, List } from "lucide-react";
import "../../styles/volunteer/CommitmentsViewToggle.css";
import "../../styles/volunteer/Commitments.css";

const VIEW_LIST = "list";
const VIEW_CALENDAR = "calendar";

function Commitments() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState(new Set());
  const [expandedInstructions, setExpandedInstructions] = useState(new Set());
  const [resultMessage, setResultMessage] = useState({});
  const [viewMode, setViewMode] = useState(VIEW_LIST);

  const refreshCommitments = useCallback(async () => {
    const commitments = await serviceCommitmentAPI.getFutureCommitments();
    setShifts(commitments);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshCommitments();
      } catch (error) {
        console.error("fetch error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCommitments]);

  // Format date and time
  const formatDateTime = (timestamp) => {
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp),
    };
  };

  // Handle shift selection
  const handleShiftToggle = (shift) => {
    setResultMessage({});
    const newSelectedShifts = new Set(selectedShifts);
    if (selectedShifts.has(shift._id)) {
      newSelectedShifts.delete(shift._id);
    } else {
      newSelectedShifts.add(shift._id);
    }
    setSelectedShifts(newSelectedShifts);
  };

  const toggleInstructions = (shiftId) => {
    const nextExpanded = new Set(expandedInstructions);
    if (nextExpanded.has(shiftId)) {
      nextExpanded.delete(shiftId);
    } else {
      nextExpanded.add(shiftId);
    }
    setExpandedInstructions(nextExpanded);
  };

  // Handle cancellagion
  const handleCancel = async () => {
    try {
      for (const commitment_id of selectedShifts) {
        await serviceCommitmentAPI.cancelCommitment(commitment_id);
      }
      setResultMessage({ text: "Cancelled successfully", success: true });
      setSelectedShifts(new Set());
      await refreshCommitments();
    } catch (error) {
      console.error("Error cancelling shifts:", error);
      setResultMessage({
        text: error?.message || "Could not cancel shift(s). Please try again.",
        success: false,
      });
    }
  };

  // Process shift data for rendering (eliminates duplication)
  const processShiftData = (shift) => {
    const shelter = shift.shelter;
    const startDate = formatDate(shift.shift_start);
    const startTime = formatTime(shift.shift_start);
    const endTime = formatTime(shift.shift_end);
    const isSelected = selectedShifts.has(shift._id);
    const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60));
    const instructions = (shift.instructions || "").trim();
    const canInteract = true;
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      isSelected,
      duration,
      canInteract,
      hasInstructions: instructions.length > 0,
      instructions,
    };
  };
  const closeModal = () => {
    setResultMessage({});
  };

  // Sort and format selected shifts for display
  const sortedSelectedShifts = useMemo(() => {
    return Array.from(selectedShifts)
      .map((shiftId) => {
        const shift = shifts.find((s) => s._id === shiftId);
        return shift;
      })
      .filter((shift) => shift) // Remove any undefined shifts
      .sort((a, b) => new Date(a.shift_start).getTime() - new Date(b.shift_start).getTime()) // Sort chronologically
      .map((shift) => {
        const shelter = shift.shelter;
        const startTime = formatDateTime(shift.shift_start);
        const endTime = formatDateTime(shift.shift_end);
        return {
          shift,
          shelter,
          startTime,
          endTime,
        };
      });
  }, [selectedShifts, shifts]);

  const orderedShifts = useMemo(
    () =>
      [...shifts].sort(
        (a, b) => new Date(a.shift_start).getTime() - new Date(b.shift_start).getTime(),
      ),
    [shifts],
  );

  if (loading) {
    return <Loading />;
  }

  const hasShifts = shifts.length > 0;
  const nextShift = orderedShifts[0];
  const shelterCount = new Set(
    orderedShifts.map((shift) => shift.shelter_id || shift.shelter?.name).filter(Boolean),
  ).size;

  return (
    <div className="commitments-page has-sticky-bottom">
      <section className="commitments-hero" aria-labelledby="commitments-title">
        <div className="commitments-hero-copy">
          <span className="commitments-eyebrow">YOUR VOLUNTEER SCHEDULE</span>
          <h1 id="commitments-title">Upcoming shifts</h1>
          <p>Everything you need to plan your next visit and show up ready to help.</p>
        </div>
        <div className="commitments-hero-icon" aria-hidden="true">
          <CalendarDays size={42} strokeWidth={1.5} />
        </div>
      </section>
      <SubmitResultsMessage resultMessage={resultMessage} closeModal={closeModal} />
      <div className="commitments-overview" aria-label="Schedule summary">
        <div className="commitments-stat">
          <span className="commitments-stat-label">Confirmed shifts</span>
          <strong>{shifts.length}</strong>
          <span className="commitments-stat-detail">On your schedule</span>
        </div>
        <div className="commitments-stat">
          <span className="commitments-stat-label">Next shift</span>
          <strong>{nextShift ? formatDate(nextShift.shift_start) : "—"}</strong>
          <span className="commitments-stat-detail">
            {nextShift
              ? `${formatTime(nextShift.shift_start)} · ${nextShift.shelter?.name || "Shelter"}`
              : "Nothing scheduled yet"}
          </span>
        </div>
        <div className="commitments-stat">
          <span className="commitments-stat-label">Shelters</span>
          <strong>{shelterCount}</strong>
          <span className="commitments-stat-detail">You are helping</span>
        </div>
      </div>
      <div className="commitments-toolbar">
        <div className="commitments-toolbar-copy">
          <h2>Your schedule</h2>
          <p>
            {hasShifts
              ? "Select a shift in list view if you need to cancel it."
              : "Your confirmed shifts will appear here."}
          </p>
        </div>
        <div className="commitments-view-toggle" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === VIEW_LIST}
            className={`commitments-view-btn ${viewMode === VIEW_LIST ? "active" : ""}`}
            onClick={() => setViewMode(VIEW_LIST)}>
            <List size={17} aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === VIEW_CALENDAR}
            className={`commitments-view-btn ${viewMode === VIEW_CALENDAR ? "active" : ""}`}
            onClick={() => setViewMode(VIEW_CALENDAR)}>
            <CalendarDays size={17} aria-hidden="true" />
            Calendar
          </button>
        </div>
      </div>
      {hasShifts && <ExportAllShiftsButton shifts={shifts} />}
      {viewMode === VIEW_CALENDAR && (
        <div id="commitments-calendar-panel" role="tabpanel" aria-label="Calendar view">
          <VolunteerShiftCalendar shifts={orderedShifts} />
        </div>
      )}
      {viewMode === VIEW_LIST && (
        <div id="commitments-list-panel" role="tabpanel" aria-label="List view">
          {!hasShifts && (
            <div className="commitments-empty">
              <div className="commitments-empty-icon" aria-hidden="true">
                <CalendarDays size={32} />
              </div>
              <h2>No upcoming shifts yet</h2>
              <p>Find a shift on Sign Up To Help and your confirmed schedule will show up here.</p>
            </div>
          )}
          {hasShifts && (
            <>
              {/* Desktop Table View */}
              <div className="table-container desktop-only">
                <table className="shifts-table">
                  <thead>
                    <tr className="table-header">
                      <th>Shelter</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Shelter Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedShifts.map((shift) => (
                      <DesktopShiftRow
                        key={shift._id}
                        shiftData={processShiftData(shift)}
                        handleShiftToggle={handleShiftToggle}
                        showInstructions={true}
                        isInstructionsOpen={expandedInstructions.has(shift._id)}
                        onInstructionsToggle={toggleInstructions}
                        instructionsColSpan={5}
                        showCalendarExport={true}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="cards-container mobile-only">
                {orderedShifts.map((shift) => (
                  <MobileShiftCard
                    key={shift._id}
                    shiftData={processShiftData(shift)}
                    handleShiftToggle={handleShiftToggle}
                    showInstructions={true}
                    showCalendarExport={true}
                    isInstructionsOpen={expandedInstructions.has(shift._id)}
                    onInstructionsToggle={toggleInstructions}
                  />
                ))}
              </div>
              {selectedShifts.size > 0 && (
                <div className="sticky-signup-container commitments-cancel-bar">
                  <div className="selected-shifts-summary">
                    <h3 className="summary-title">
                      Shifts Selected to Cancel ({selectedShifts.size})
                    </h3>
                    <div className="list">
                      {sortedSelectedShifts.map(({ shift, shelter, startTime, endTime }) => (
                        <div key={shift._id} className="tagline-small">
                          • {shelter?.name || "Shelter"} - on {startTime.date} at {startTime.time} -{" "}
                          {endTime.time}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="signup-section">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={selectedShifts.size === 0}
                      className={`signup-button ${selectedShifts.size > 0 ? "enabled signedup" : "disabled"}`}>
                      Cancel {selectedShifts.size} Shift{selectedShifts.size !== 1 ? "s" : ""}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Commitments;
