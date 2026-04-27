import { useState, useMemo, useEffect, useId } from 'react';
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
import { Calendar } from 'lucide-react';

/**
 * Loads data for the shift signup view. Kept at module scope so mount and post–sign-up
 * refresh share one implementation without useEffect depending on a hook callback.
 */
async function loadShiftSignupPageData() {
  const sheltersData = await shelterAPI.getShelters();
  const futureShifts = await serviceShiftAPI.getFutureShifts();
  const commitments = await serviceCommitmentAPI.getFutureCommitments();
  return { sheltersData, futureShifts, commitments };
}

/** Filter shifts to those starting on the given YYYY-MM-DD (local calendar day). */
function filterShiftsByLocalDate(shifts, dateStr) {
  if (!dateStr) return shifts;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return shifts;
  const [y, m, d] = parts;
  return shifts.filter((s) => {
    const t = new Date(s.shift_start);
    return (
      t.getFullYear() === y &&
      t.getMonth() === m - 1 &&
      t.getDate() === d
    );
  });
}

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
  /** YYYY-MM-DD from input type="date", or '' to show all days */
  const [filterDate, setFilterDate] = useState('');
  const [a11yAnnouncement, setA11yAnnouncement] = useState('');
  const [expandedInstructions, setExpandedInstructions] = useState(new Set());
  const filterDateId = useId();
  const filterHintId = useId();
  const [dateFieldFocused, setDateFieldFocused] = useState(false);
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { sheltersData, futureShifts, commitments } = await loadShiftSignupPageData();
        if (cancelled) return;
        setShelters(sheltersData);
        setShifts(futureShifts);
        setCommitments(commitments);
      } catch (error) {
        console.error("fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp)
    };
  };

  // Calculate need percentage (1 - current_volunteers/required_volunteers)
  const calculateNeed = (shift) => {
    return 1 - (shift.volunteer_count / shift.required_volunteer_count);
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

  const toggleInstructions = (shiftId) => {
    const next = new Set(expandedInstructions);
    if (next.has(shiftId)) {
      next.delete(shiftId);
    } else {
      next.add(shiftId);
    }
    setExpandedInstructions(next);
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
    const instructions = (shift.instructions || '').trim();
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
      canInteract: shift.can_sign_up && (!hasConflict || isSelected) && !signedUp,
      hasInstructions: instructions.length > 0,
      instructions,
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

  const filteredShifts = useMemo(
    () => filterShiftsByLocalDate(sortedShifts, filterDate),
    [sortedShifts, filterDate]
  );

  useEffect(() => {
    const total = sortedShifts.length;
    if (!filterDate) {
      setA11yAnnouncement(
        `Showing all ${total} open shift${total !== 1 ? 's' : ''}.`
      );
      return;
    }
    const label = new Date(`${filterDate}T12:00:00`).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
    const n = filteredShifts.length;
    if (n === 0) {
      setA11yAnnouncement(
        `Selected ${label}. No open shifts on this day. Try another date or clear the filter to see all shifts.`
      );
    } else {
      setA11yAnnouncement(
        `Selected ${label}. ${n} open shift${n !== 1 ? 's' : ''} available.`
      );
    }
  }, [filterDate, sortedShifts.length, filteredShifts.length]);

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
      const { sheltersData, futureShifts, commitments: nextCommitments } =
        await loadShiftSignupPageData();
      setShelters(sheltersData);
      setShifts(futureShifts);
      setCommitments(nextCommitments);
    }
    catch (error) {
      console.error("Error submitting shifts:", error);
    } 
  };

  // Modal for sign up results
  const closeModal = () => {
    setShowResults(false);
  };

  // Sort and format selected shifts for display
  const sortedSelectedShifts = useMemo(() => {
    return Array.from(selectedShifts)
      .map(shiftId => {
        const shift = shifts.find(s => s._id === shiftId);
        return shift;
      })
      .filter(shift => shift) // Remove any undefined shifts
      .sort((a, b) => new Date(a.shift_start).getTime() - new Date(b.shift_start).getTime()) // Sort chronologically
      .map(shift => {
        const shelter = shelterMap[shift.shelter_id];
        const startTime = formatDateTime(shift.shift_start);
        const endTime = formatDateTime(shift.shift_end);
        return {
          shift,
          shelter,
          startTime,
          endTime
        };
      });
  }, [selectedShifts, shifts, shelterMap]);

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="has-sticky-bottom volunteer-shift-signup">
      <header className="signup-page-header">
        <h1 className="title-small signup-page-title">Volunteer Shift Sign-up</h1>
        <p className="signup-page-subtitle">
          Browse open shifts and sign up where shelters need volunteers most.
        </p>
      </header>
      <div
        className="signup-sr-live"
        aria-live="polite"
        aria-atomic="true"
      >
        {a11yAnnouncement}
      </div>
      <div className="signup-controls-panel">
        <div className="controls-section">
          <div className="signup-date-filter">
            <label className="signup-date-label" htmlFor={filterDateId}>
              Filter by date
            </label>
            <div className="signup-date-row">
              <div className="signup-date-input-wrap">
                <span className="signup-date-input-icon" aria-hidden="true">
                  <Calendar size={20} strokeWidth={1.75} />
                </span>
                {!filterDate && !dateFieldFocused && (
                  <span className="signup-date-placeholder" aria-hidden="true">
                    Pick a date
                  </span>
                )}
                <input
                  id={filterDateId}
                  type="date"
                  className={`signup-date-input ${!filterDate && !dateFieldFocused ? 'signup-date-input--ghost' : ''}`}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  onFocus={() => setDateFieldFocused(true)}
                  onBlur={() => setDateFieldFocused(false)}
                  aria-describedby={filterHintId}
                  aria-label="Pick a date to filter shifts"
                />
              </div>
              {filterDate && (
                <button
                  type="button"
                  className="signup-clear-date-btn"
                  onClick={() => setFilterDate('')}
                >
                  Clear
                </button>
              )}
            </div>
            <p id={filterHintId} className="signup-date-hint">
              {filterDate
                ? 'Only shifts starting on this day are shown. Clear to see all open shifts.'
                : 'Optional: choose a day to focus on shelters with openings that day.'}
            </p>
          </div>
          <div className="sort-section">
            <label className="sort-section-label" htmlFor="shift-signup-sort">
              Sort list by
            </label>
            <select
              id="shift-signup-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Date &amp; time</option>
              <option value="shelter">Shelter name</option>
              <option value="need">Need (priority)</option>
            </select>
          </div>
        </div>
      </div>
      {sortedShifts.length > 0 && (
        <p className="signup-results-meta" aria-live="polite">
          {filterDate ? (
            <span className="signup-results-copy">
              {filteredShifts.length === 1
                ? 'Shift on the selected date'
                : 'Shifts on the selected date'}
            </span>
          ) : (
            <span className="signup-results-copy">
              {sortedShifts.length === 1
                ? 'Open shift available'
                : 'Open shifts available'}
            </span>
          )}
        </p>
      )}
      {filterDate && filteredShifts.length === 0 && sortedShifts.length > 0 && (
        <div className="signup-empty-day signup-empty-day--filtered" role="status">
          <span className="signup-empty-icon" aria-hidden="true">📅</span>
          <div>
            <p className="signup-empty-day-title">No open shifts on this day</p>
            <p className="signup-empty-day-text">
              Try another date or clear the filter to see all available shifts.
            </p>
          </div>
        </div>
      )}
      {sortedShifts.length === 0 && (
        <div className="signup-empty-day signup-empty-day--global" role="status">
          <span className="signup-empty-icon" aria-hidden="true">✨</span>
          <p className="signup-empty-day-text">
            There are no open shifts to sign up for right now. Check back later.
          </p>
        </div>
      )}
      {/* Desktop Table View */}
      <div
        className="table-container desktop-only"
        role="region"
        aria-label="Open shifts list"
      >
        <table className="shifts-table">
          <thead>
            <tr className="table-header">
              <th>Shelter</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Shelter Instructions</th>
              <th>Volunteers Available</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {filteredShifts.map((shift) => (
              <DesktopShiftRow
                key={shift._id}
                shiftData={processShiftData(shift)}
                handleShiftToggle={handleShiftToggle}
                showInstructions={true}
                isInstructionsOpen={expandedInstructions.has(shift._id)}
                onInstructionsToggle={toggleInstructions}
                instructionsColSpan={7}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only" role="region" aria-label="Open shifts list">
        {filteredShifts.map((shift) => (
          <MobileShiftCard
            key={shift._id}
            shiftData={processShiftData(shift)}
            handleShiftToggle={handleShiftToggle}
            showInstructions={true}
            isInstructionsOpen={expandedInstructions.has(shift._id)}
            onInstructionsToggle={toggleInstructions}
          />
        ))}
      </div>
      {/* Selected Shifts Summary */}
      <div className="sticky-signup-container volunteer-sticky-signup">
        <div className="sticky-signup-inner">
          <div className="sticky-signup-main">
            {selectedShifts.size > 0 && (
              <div className="selected-shifts-summary">
                <h3 className="summary-title">
                  Selected shifts ({selectedShifts.size})
                </h3>
                <div className="list">
                  {sortedSelectedShifts.map(({ shift, shelter, startTime, endTime }) => (
                    <div key={shift._id} className="tagline-small">
                      • {startTime.date} at {startTime.time} - {endTime.time} - {shelter.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedShifts.size === 0 && (
              <p className="sticky-signup-hint">Select some shifts to sign up.</p>
            )}
          </div>
          <div className="signup-section signup-section--sticky">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={selectedShifts.size === 0}
              className={`signup-button signup-button--cta ${selectedShifts.size > 0 ? 'enabled' : 'disabled'}`}
            >
              {selectedShifts.size === 0
                ? 'Sign up for shifts'
                : `Sign up for ${selectedShifts.size} shift${selectedShifts.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
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