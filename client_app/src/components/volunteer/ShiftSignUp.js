import { useState, useMemo, useEffect } from 'react';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';
import { formatDate } from '../../formatting/FormatDateTime';
import { formatTime } from '../../formatting/FormatDateTime';

const VolunteerShiftSignup = () => {

  const [loading, setLoading] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [volunteerEmail, setVolunteerEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheltersData = await shelterAPI.getShelters();
        const futureShifts = await serviceShiftAPI.getFutureShifts();
        setShelters(sheltersData);
        setShifts(futureShifts)
        setLoading(false);
      }
      catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  // Create a map of shelters for quick lookup
  const shelterMap = useMemo(() => {
    return shelters.reduce((acc, shelter) => {
      acc[shelter._id] = shelter;
      return acc;
    }, {});
  }, [shelters]);

  console.log("shelterMap:", shelterMap);
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
  const handleSignUp = () => {
    if (!volunteerEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }
    
    if (selectedShifts.size === 0) {
      alert('Please select at least one shift.');
      return;
    }
    
    const selectedShiftDetails = Array.from(selectedShifts).map(shiftId => {
      const shift = shifts.find(s => s._id === shiftId);
      const shelter = shelterMap[shift.shelter_id];
      const startTime = formatDateTime(shift.shift_start);
      return `${shelter.name} - ${shift.shift_name} on ${startTime.date} at ${startTime.time}`;
    });
    
    alert(`Sign-up request submitted for:\n${selectedShiftDetails.join('\n')}\n\nEmail: ${volunteerEmail}`);
    
    // Reset form
    setSelectedShifts(new Set());
    setVolunteerEmail('');
  };

  return (
    <div>
      <h1 className="main-title">Volunteer Shift Sign-up</h1>
      <div className="controls-section">
        {/* Sort Controls */}
        <div className="sort-section">
          <label className="sort-label">Sort by:</label>
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
      {/* Selected Shifts Summary */}
      {selectedShifts.size > 0 && (
        <div className="selected-shifts-summary">
          <h3 className="summary-title">
            Selected Shifts ({selectedShifts.size})
          </h3>
          <div className="selected-shifts-list">
            {Array.from(selectedShifts).map(shiftId => {
              const shift = shifts.find(s => s._id === shiftId);
              const shelter = shelterMap[shift.shelter_id];
              const startTime = formatDateTime(shift.shift_start);
              return (
                <div key={shiftId} className="selected-shift-item">
                  • {shelter.name} - {shift.shift_name} on {startTime.date} at {startTime.time}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Desktop Table View */}
      <div className="table-container desktop-only">
        <table className="shifts-table">
          <thead>
            <tr className="table-header">
              <th>Select</th>
              <th>Shelter</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Volunteers</th>
              <th>Need Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedShifts.map((shift) => {
              const shelter = shelterMap[shift.shelter_id];
              const startDate = formatDate(shift.shift_start);
              const startTime = formatTime(shift.shift_start);
              const needLevel = calculateNeed(shift);
              const isSelected = selectedShifts.has(shift._id);
              const conflicts = getConflictingShifts(shift);
              const hasConflict = conflicts.length > 0;
              const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60 ));

              let needClass = 'need-low';
              if (needLevel > 0.6) needClass = 'need-high';
              else if (needLevel > 0.3) needClass = 'need-medium';

              return (
                <tr 
                  key={shift._id} 
                  className={`table-row ${isSelected ? 'selected' : ''} ${hasConflict && !isSelected ? 'conflicted' : ''}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleShiftToggle(shift)}
                      disabled={!shift.can_sign_up || (hasConflict && !isSelected)}
                      className="shift-checkbox"
                    />
                  </td>
                  <td>
                    <div className="shelter-name">{shelter?.name}</div>
                    <div className="shelter-location">
                      {shelter?.address.city}, {shelter?.address.state}
                    </div>
                  </td>
                  <td>{startDate}</td>
                  <td>
                    {startTime}
                  </td>
                  <td>{duration}h</td>
                  <td>
                    {shift.volunteers.length} / {shift.required_volunteer_count} required
                    <br />
                    <span className="max-volunteers">
                      (max {shift.max_volunteer_count})
                    </span>
                  </td>
                  <td>
                    <div className={`need-badge ${needClass}`}>
                      {Math.round(needLevel * 100)}% need
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only">
        {sortedShifts.map((shift) => {
          const shelter = shelterMap[shift.shelter_id];
          const startTime = formatDateTime(shift.shift_start);
          const endTime = formatDateTime(shift.shift_end);
          const needLevel = calculateNeed(shift);
          const isSelected = selectedShifts.has(shift._id);
          const conflicts = getConflictingShifts(shift);
          const hasConflict = conflicts.length > 0;
          const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60 * 100)) / 10;

          let needClass = 'need-low';
          if (needLevel > 0.6) needClass = 'need-high';
          else if (needLevel > 0.3) needClass = 'need-medium';

          return (
            <div 
              key={shift._id} 
              className={`shift-card ${isSelected ? 'selected' : ''} ${hasConflict && !isSelected ? 'conflicted' : ''}`}
            >
              <div className="card-header">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleShiftToggle(shift)}
                  disabled={!shift.can_sign_up || (hasConflict && !isSelected)}
                  className="shift-checkbox"
                />
                <div className="card-title">
                  <div className="shelter-name">{shelter?.name}</div>
                  <div className="shift-name">{shift.shift_name}</div>
                </div>
                <div className={`need-badge ${needClass}`}>
                  {Math.round(needLevel * 100)}% need
                </div>
              </div>       
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span>{shelter?.address.city}, {shelter?.address.state}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{startTime.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span>{startTime.time} - {endTime.time} ({duration}h)</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Volunteers:</span>
                  <span>{shift.volunteers.length} / {shift.required_volunteer_count} required (max {shift.max_volunteer_count})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Sign Up Button */}
      <div className="signup-section">
        <button
          onClick={handleSignUp}
          disabled={selectedShifts.size === 0 || !volunteerEmail.trim()}
          className={`signup-button ${selectedShifts.size > 0 && volunteerEmail.trim() ? 'enabled' : 'disabled'}`}
        >
          Sign Up for {selectedShifts.size} Shift{selectedShifts.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default VolunteerShiftSignup;