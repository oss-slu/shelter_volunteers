import { useState, useMemo, useEffect } from 'react';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';
import { serviceCommitmentAPI } from '../../api/serviceCommitment';
import { formatDate } from '../../formatting/FormatDateTime';
import { formatTime } from '../../formatting/FormatDateTime';
import { getUser } from '../../authentication/user';
import SignUpResults from './SignUpResults';
import { MobileShiftCard } from './MobileShiftCard';
import { DesktopShiftRow } from './DesktopShiftRow';
import Loading from '../Loading';


function VolunteerShiftSignup(){
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [resultShifts, setResultShifts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const user = getUser();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheltersData = await shelterAPI.getShelters();
        const futureShifts = await serviceShiftAPI.getFutureShifts();
        const commitments = await serviceCommitmentAPI.getFutureCommitments();

        setShelters(sheltersData);
        setShifts(futureShifts);
        setCommitments(commitments);
        setLoading(false);
      } catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [results]);
  
  // Create a map of shelters for quick lookup
  const shelterMap = useMemo(() => {
    return shelters.reduce((acc, shelter) => {
      acc[shelter._id] = shelter;
      return acc;
    }, {});
  }, [shelters]);

  // Format date and time
  const formatDateTime = (timestamp) => {
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp)
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
    // Check conflicts with selected shifts
    const selectedConflicts = Array.from(selectedShifts).filter(shiftId => {
      const shift = shifts.find(s => s._id === shiftId);
      return shift && shift._id !== targetShift._id && shiftsOverlap(shift, targetShift);
    });

    // Check conflicts with already committed shifts
    const committedConflicts = commitments
      .map(commitment => shifts.find(s => s._id === commitment.service_shift_id))
      .filter(shift => shift && shift._id !== targetShift._id && shiftsOverlap(shift, targetShift))
      .map(shift => shift._id);

    // Combine and deduplicate
    return Array.from(new Set([...selectedConflicts, ...committedConflicts]));
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
    let signedUp = commitments.some(commitment => commitment.service_shift_id === shift._id);
    let needClass = 'need-low';
    let priority = 'Low';
    if (needLevel > 0.6) {
      priority = 'High';
      needClass = 'need-high';
    }
    else if (needLevel > 0.3) {
      priority = 'Medium';
      needClass = 'need-medium';
    }
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      signedUp,
      needLevel,
      needClass,
      priority,
      isSelected,
      hasConflict,
      duration,
      canInteract: shift.can_sign_up && (!hasConflict || isSelected) && !signedUp
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
      console.log("Submitting shifts:", selectedShifts);
      const shiftsList = Array.from(selectedShifts).map(shiftId => ({
        volunteer_id: user.email,
        service_shift_id: shiftId
      }));
      const response = await serviceCommitmentAPI.addCommitments(shiftsList);
      console.log(response)
      setResults(response);
      setResultShifts(sortedShifts.filter(shift => selectedShifts.has(shift._id)));
      setShowResults(true);
      // Reset form
      setSelectedShifts(new Set());
    }
    catch (error) {
      console.error("Error submitting shifts:", error);
    } 
  };

  // Modal for sign up results
  const closeModal = () => {
    setShowResults(false);
  };

  if (loading) {
    return <Loading />;
  }
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
            <option value="need">Priority</option>
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
              <th>Volunteers Available</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {sortedShifts.map((shift) => (
              <DesktopShiftRow key={shift._id} shiftData={processShiftData(shift)} handleShiftToggle={handleShiftToggle} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only">
        {sortedShifts.map((shift) => (
          <MobileShiftCard key={shift._id} shiftData={processShiftData(shift)} handleShiftToggle={handleShiftToggle} />
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
      {/* Modal markup */}
      {showResults && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <SignUpResults 
              results={results}
              shifts={resultShifts}
              shelterMap={shelterMap}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerShiftSignup;