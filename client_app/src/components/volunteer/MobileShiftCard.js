import { PriorityBadge } from './PriorityBadge';
import { ShelterInfo } from './ShelterInfo';
import { VolunteerCount } from './VolunteerCount';

export const MobileShiftCard = ({ shiftData, handleShiftToggle }) => (
  <div 
    key={shiftData.shift._id} 
    className={`dashboard-button table-row ${shiftData.isSelected ? 'selected' : ''} ${shiftData.hasConflict && !shiftData.isSelected ? 'conflicted' : ''} ${shiftData.canInteract ? 'clickable' : 'disabled'}`}
    onClick={() => shiftData.canInteract && handleShiftToggle(shiftData.shift)}
>
    <div className="card-header">
      <div className="card-title">
        <ShelterInfo shelter={shiftData.shelter} showLocation={true} />
      </div>
      {shiftData.priority && (
      <div>
        Priority: <PriorityBadge priority={shiftData.priority}/>
      </div>
      )}
    </div>       
    <div className="card-details">
      <div className="detail-row">
        <span className="detail-label">Date:</span>
        <span>{shiftData.startDate}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Time:</span>
        <span>{shiftData.startTime} - {shiftData.endTime} ({shiftData.duration}h)</span>
      </div>
      {shiftData.shift.volunteers && (
        <div className="detail-row">
          <span className="detail-label">Volunteers Available:</span>
          <VolunteerCount shift={shiftData.shift} />
        </div>
      )}
    </div>
    {shiftData.isSelected && (
    <div className="detail-row  selected-indicator-desktop">
      <span className="checkmark">✓ Selected</span>
    </div>
    )}
    {shiftData.signedUp && (
    <div className="detail-row  selected-indicator-desktop">
      <span className="checkmark signedup"> Signed Up</span>
    </div>
    )}
  </div>
);