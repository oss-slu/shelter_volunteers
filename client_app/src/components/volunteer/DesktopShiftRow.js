import { ShelterInfo } from './ShelterInfo';
import { VolunteerCount } from './VolunteerCount';
import { PriorityBadge } from './PriorityBadge';
export const DesktopShiftRow = ({
  shiftData,
  handleShiftToggle,
  showInstructions = false,
  isInstructionsOpen = false,
  onInstructionsToggle = null,
  instructionsColSpan = 1,
}) => {
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
        </td>
        <td>{shiftData.startDate}</td>
        <td>{shiftData.startTime}</td>
        <td>{shiftData.duration}h</td>
        {showInstructions && (
          <td>
            {shiftData.hasInstructions ? (
              <button
                className="button-transparent instructions-toggle-button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (onInstructionsToggle) {
                    onInstructionsToggle(shiftData.shift._id);
                  }
                }}
              >
                {isInstructionsOpen ? "Hide Instructions" : "View Instructions"}
              </button>
            ) : (
              <span className="instructions-empty">No instructions</span>
            )}
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
