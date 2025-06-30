import { useState, useEffect } from 'react';
import { serviceCommitmentAPI } from '../../api/serviceCommitment';
import { formatDate } from '../../formatting/FormatDateTime';
import { formatTime } from '../../formatting/FormatDateTime';
import { MobileShiftCard } from './MobileShiftCard';
import { DesktopShiftRow } from './DesktopShiftRow';
import { SubmitResultsMessage } from './SubmitResultsMessage';
import Loading from '../Loading';

function Commitments(){
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState(new Set());
  const [resultMessage, setResultMessage] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commitments = await serviceCommitmentAPI.getFutureCommitments();
        setShifts(commitments);
        setLoading(false);
      } catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [results]);
  

  // Format date and time
  const formatDateTime = (timestamp) => {
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp)
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

  // Handle cancellagion
  const handleCancel = async () => {
    try {
      console.log("Cancelling shifts:", selectedShifts);
      let responses = [];
      for (const commitment_id of selectedShifts) {
        const response = await serviceCommitmentAPI.cancelCommitment(commitment_id);
        responses.push(response);
      }
      setResults(responses);
      setResultMessage({'text': 'Cancelled successfully', 'success': true});
      // Reset form
      setSelectedShifts(new Set());
    }
    catch (error) {
      console.error("Error cancelling shifts:", error);
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
    const canInteract = true;
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      isSelected,
      duration,
      canInteract
    };
  };  
  const closeModal = () => {
    setResultMessage({});
  };

  if (loading) {
    return <Loading />;
  }

  if (shifts.length === 0) {
    return (
      <div>
        <h1 className="title-small">Your Upcoming Shifts</h1>
        <div className="description">
          <p className="tagline-small">
            You have no upcoming shifts. You can sign up for shifts through the "Sign Up To Help" menu option.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title-small">Your Upcoming Shifts</h1>
      <SubmitResultsMessage
        resultMessage={resultMessage}
        closeModal={closeModal}
      />
      <div className="description">
        <p className="tagline-small">
          Here are your upcoming shifts. You can select shifts to cancel them.
        </p>
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
              <DesktopShiftRow key={shift._id} shiftData={processShiftData(shift)} handleShiftToggle={handleShiftToggle} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="cards-container mobile-only">
        {shifts.map((shift) => (
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
              const shelter = shift.shelter;
              const startTime = formatDateTime(shift.shift_start);
              return (
                <div key={shiftId} className="tagline-small">
                  • {shelter.name} - on {startTime.date} at {startTime.time}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Sign Up Button */}
      <div className="signup-section">
        <button
          onClick={handleCancel}
          disabled={selectedShifts.size === 0}
          className={`signup-button ${selectedShifts.size > 0 ? 'enabled' : 'disabled'}`}
        >
          Cancel {selectedShifts.size} Shift{selectedShifts.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

export default Commitments;