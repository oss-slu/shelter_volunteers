import { useState, useMemo, useEffect } from 'react';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';
import { serviceCommitmentAPI } from '../../api/serviceCommitment';
import { formatDate } from '../../formatting/FormatDateTime';
import { formatTime } from '../../formatting/FormatDateTime';
import { getUser } from '../../authentication/user';
import { Address } from './Address';

const VolunteerShiftSignup = () => {
  const [loading, setLoading] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const user = getUser();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheltersData = await shelterAPI.getShelters();
        const futureShifts = await serviceShiftAPI.getFutureShifts();
        setShelters(sheltersData);
        setShifts(futureShifts);
        setLoading(false);
      } catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Create a map of shelters for quick lookup
  const shelterMap = useMemo(() => {
    return shelters.reduce((acc, shelter) => {
      acc[shelter._id] = shelter;
      return acc;
    }, {});
  }, [shelters]);

  // Format date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Calculate need percentage (1 - current_volunteers/required_volunteers)
  const calculateNeed = (shift) => {
    return 1 - (shift.volunteers.length / shift.required_volunteer_count);
  };

  // Check if shifts overlap
  const shiftsOverlap = (shift1, shift2) => {
    return (shift1.shift_start < shift2.shift_end && shift2.shift_start < shift1.shift_end);
  };

  // Get conflicting shifts for a given shift
  const getConflictingShifts = (targetShift) => {
    return Array.from(selectedShifts).filter(shiftId => {
      const shift = shifts.find(s => s._id === shiftId);
      return shift && shift._id !== targetShift._id && shiftsOverlap(shift, targetShift);
    });
  };

  // Process shift data for rendering (eliminates duplication)
  const processShiftData = (shift) => {
    const shelter = shelterMap[shift.shelter_id];
    const startDate = formatDate(shift.shift_start);
    const startTime = formatTime(shift.shift_start);
    const endTime = formatTime(shift.shift_end);
    const needLevel = calculateNeed(shift);
    const isSelected = selectedShifts.has(shift._id);
    const conflicts = getConflictingShifts(shift);
    const hasConflict = conflicts.length > 0;
    const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60));

    let needClass = 'need-low';
    if (needLevel > 0.6) needClass = 'need-high';
    else if (needLevel > 0.3) needClass = 'need-medium';

    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      needLevel,
      needClass,
      isSelected,
      hasConflict,
      duration,
      canInteract: shift.can_sign_up && (!hasConflict || isSelected)
    };
  };

  // Sort shifts based on selected criteria
  const sortedShifts = useMemo(() => {
    const sortedArray = [...shifts];
    
    switch (sortBy) {
      case 'shelter':
        sortedArray.sort((a, b) => {
          const shelterA = shelterMap[a.shelter_id]?.name || '';
          const shelterB = shelterMap[b.shelter_id]?.name || '';
          return shelterA.localeCompare(shelterB);
        });
        break;
      case 'date':
        sortedArray.sort((a, b) => a.shift_start - b.shift_start);
        break;
      case 'need':
        sortedArray.sort((a, b) => calculateNeed(b) - calculateNeed(a));
        break;
      default:
        break;
    }
    
    return sortedArray;
  }, [shifts, sortBy, shelterMap]);

  // Handle shift selection
  const handleShiftToggle = (shift) => {
    const newSelectedShifts = new Set(selectedShifts);
    
    if (selectedShifts.has(shift._id)) {
      newSelectedShifts.delete(shift._id);
    } else {
      // Check for conflicts
      const conflicts = getConflictingShifts(shift);
      if (conflicts.length > 0) {
        alert(`This shift conflicts with ${conflicts.length} already selected shift(s). Please deselect conflicting shifts first.`);
        return;
      }
      newSelectedShifts.add(shift._id);
    }
    
    setSelectedShifts(newSelectedShifts);
  };

  // Handle sign up
  const handleSignUp = async () => {
    try {
      const shiftsList = Array.from(selectedShifts).map(shiftId => ({
        volunteer_id: user.email,
        service_shift_id: shiftId
      }));
      const response = await serviceCommitmentAPI.addCommitments(shiftsList);
      console.log(response)
      // Reset form
      setSelectedShifts(new Set());
    }
    catch (error) {
      console.error("Error submitting shifts:", error);
    } 
  };

  // Component for rendering need badge (shared between desktop and mobile)
  const NeedBadge = ({ needLevel, needClass }) => (
    <div className={`need-badge ${needClass}`}>
      {Math.round(needLevel * 100)}% need
    </div>
  );

  // Component for rendering shelter info (shared between desktop and mobile)
  const ShelterInfo = ({ shelter, showLocation = true }) => (
    <>
      <div className="shelter-name">{shelter?.name}</div>
      {showLocation && (
        <div className="shelter-location">
          <Address address={shelter.address}/>
        </div>
      )}
    </>
  );

  // Component for rendering volunteer count info (shared between desktop and mobile)
  const VolunteerCount = ({ shift, inline = false }) => {
    const content = (
      <>
        {shift.volunteers.length} / {shift.required_volunteer_count} required
        {inline ? ' ' : <br />}
        <span className="max-volunteers">
          (max {shift.max_volunteer_count})
        </span>
      </>
    );
    return inline ? <span>{content}</span> : <div>{content}</div>;
  };

  // Desktop table row component
  const DesktopShiftRow = ({ shiftData }) => (
    <tr 
      key={shiftData.shift._id} 
      className={`table-row ${shiftData.isSelected ? 'selected' : ''} ${shiftData.hasConflict && !shiftData.isSelected ? 'conflicted' : ''} ${shiftData.canInteract ? 'clickable' : 'disabled'}`}
      onClick={() => shiftData.canInteract && handleShiftToggle(shiftData.shift)}
    >
      <td>
        <ShelterInfo shelter={shiftData.shelter} />
        {shiftData.isSelected && (
          <div className="selected-indicator-desktop">
            <span className="checkmark">✓ Selected</span>
          </div>
        )}
      </td>
      <td>{shiftData.startDate}</td>
      <td>{shiftData.startTime}</td>
      <td>{shiftData.duration}h</td>
      <td>
        <VolunteerCount shift={shiftData.shift} />
      </td>
      <td>
        <NeedBadge needLevel={shiftData.needLevel} needClass={shiftData.needClass} />
      </td>
    </tr>
  );
  // Mobile card component
  const MobileShiftCard = ({ shiftData }) => (
    <div 
      key={shiftData.shift._id} 
      className={`dashboard-button table-row ${shiftData.isSelected ? 'selected' : ''} ${shiftData.hasConflict && !shiftData.isSelected ? 'conflicted' : ''} ${shiftData.canInteract ? 'clickable' : 'disabled'}`}
      onClick={() => shiftData.canInteract && handleShiftToggle(shiftData.shift)}
    >
      <div className="card-header">
        <div className="card-title">
          <ShelterInfo shelter={shiftData.shelter} showLocation={true} />
        </div>
        <NeedBadge needLevel={shiftData.needLevel} needClass={shiftData.needClass} />
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
        <div className="detail-row">
          <span className="detail-label">Volunteers:</span>
          <VolunteerCount shift={shiftData.shift} inline={true} />
        </div>
      </div>
      {shiftData.isSelected && (
        <div className="detail-row  selected-indicator-desktop">
          <span className="checkmark">✓ Selected</span>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="title-small">Volunteer Shift Sign-up</h1>
      <div className="controls-section">
        {/* Sort Controls */}
        <div className="sort-section">
          <label className="tagline-small">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Date & Time</option>
            <option value="shelter">Shelter Name</option>
            <option value="need">Need Level (High to Low)</option>
          </select>
        </div>
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
              <th>Volunteers</th>
              <th>Need Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedShifts.map((shift) => (
              <DesktopShiftRow key={shift._id} shiftData={processShiftData(shift)} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only">
        {sortedShifts.map((shift) => (
          <MobileShiftCard key={shift._id} shiftData={processShiftData(shift)} />
        ))}
      </div>
      {/* Selected Shifts Summary */}
      {selectedShifts.size > 0 && (
        <div className="selected-shifts-summary">
          <h3 className="summary-title">
            Selected Shifts ({selectedShifts.size})
          </h3>
          <div className="list">
            {Array.from(selectedShifts).map(shiftId => {
              const shift = shifts.find(s => s._id === shiftId);
              const shelter = shelterMap[shift.shelter_id];
              const startTime = formatDateTime(shift.shift_start);
              return (
                <div key={shiftId} className="tagline-small">
                  • {shelter.name} - {shift.shift_name} on {startTime.date} at {startTime.time}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Sign Up Button */}
      <div className="signup-section">
        <button
          onClick={handleSignUp}
          disabled={selectedShifts.size === 0}
          className={`signup-button ${selectedShifts.size > 0 ? 'enabled' : 'disabled'}`}
        >
          Sign Up for {selectedShifts.size} Shift{selectedShifts.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default VolunteerShiftSignup;