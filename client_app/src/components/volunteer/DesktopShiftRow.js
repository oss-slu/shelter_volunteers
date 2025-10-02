import { ShelterInfo } from './ShelterInfo';
import { VolunteerCount } from './VolunteerCount';
import { PriorityBadge } from './PriorityBadge';
export const DesktopShiftRow = ({ shiftData, handleShiftToggle }) => {
  console.log('DesktopShiftRow', shiftData);
  return(
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
  );
}