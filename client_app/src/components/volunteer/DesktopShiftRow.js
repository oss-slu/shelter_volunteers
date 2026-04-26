import { ShelterInfo } from './ShelterInfo';
import { VolunteerCount } from './VolunteerCount';
import { PriorityBadge } from './PriorityBadge';
export const DesktopShiftRow = ({
  shiftData,
  handleShiftToggle,
  handleWaitlistToggle = null,
  showInstructions = false,
  isInstructionsOpen = false,
  onInstructionsToggle = null,
  instructionsColSpan = 1,
}) => {
  if (!shiftData || !shiftData.shift) {
    return null;
  }

  const instructionsButtonLabel = isInstructionsOpen
    ? "Hide shelter instructions"
    : "View shelter instructions";

  return(
    <>
      <tr
        key={shiftData.shift._id}
        className={`table-row ${shiftData.isSelected ? 'selected' : ''} ${shiftData.canInteract ? 'clickable' : 'disabled'}`}
        onClick={() => shiftData.canInteract && handleShiftToggle(shiftData.shift)}
      >
        <td>
          <ShelterInfo shelter={shiftData.shelter} />
          {shiftData.isSelected && (
            <div className="selected-indicator-desktop">
              <span className="checkmark">✓ Selected</span>
            </div>
          )}
          {shiftData.signedUp && (
            <div className="selected-indicator-desktop">
              <span className="checkmark signedup"> Signed Up</span>
            </div>
          )}
          {shiftData.hasConflict && (
            <div className="selected-indicator-desktop">
              <span className="checkmark conflict"> Time Conflict</span>
            </div>
          )}
          {shiftData.isFull && shiftData.waitlisted && (
            <div className="selected-indicator-desktop">
              <span className="checkmark waitlisted">On Waitlist</span>
            </div>
          )}
          {shiftData.isFull && handleWaitlistToggle && (shiftData.canJoinWaitlist || shiftData.waitlisted) && (
            <div className="waitlist-action-row">
              <button
                type="button"
                className={`waitlist-button ${shiftData.waitlisted ? 'waitlist-button--leave' : 'waitlist-button--join'}`}
                disabled={shiftData.waitlistBusy}
                onClick={(event) => {
                  event.stopPropagation();
                  handleWaitlistToggle(shiftData.shift);
                }}
              >
                {shiftData.waitlistBusy
                  ? '...'
                  : shiftData.waitlisted
                    ? 'Leave Waitlist'
                    : 'Join Waitlist'}
              </button>
            </div>
          )}
        </td>
        <td>{shiftData.startDate}</td>
        <td>{shiftData.startTime}</td>
        <td>{shiftData.duration}h</td>
        {showInstructions && (
          <td>
            {shiftData.hasInstructions ? (
              <button
                className="button-transparent instructions-toggle-button"
                aria-label={instructionsButtonLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  if (onInstructionsToggle) {
                    onInstructionsToggle(shiftData.shift._id);
                  }
                }}
              >
                {isInstructionsOpen ? "Hide Instructions" : "View Instructions"}
              </button>
            ) : null}
          </td>
        )}
        {'volunteer_count' in shiftData.shift && (
          <td>
            <VolunteerCount shift={shiftData.shift} />
          </td>
        )}
        {shiftData.priority && (
          <td>
            <PriorityBadge priority={shiftData.priority} />
          </td>
        )}
      </tr>
      {showInstructions && isInstructionsOpen && shiftData.hasInstructions && (
        <tr className="instructions-row">
          <td colSpan={instructionsColSpan}>
            <div className="instructions-panel">
              <div className="instructions-title">Shelter Instructions</div>
              <div className="instructions-content">{shiftData.instructions}</div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
