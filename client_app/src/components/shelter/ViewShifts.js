import React, { useState, useEffect } from "react";
import "../../styles/shelter/UpcomingShifts.css";
import ServiceShiftDetails from "./ServiceShiftDetails.js";
import { EditRequestModal } from "./EditRequestModal.js";
import { CancelRequestModal } from "./CancelRequestModal.js";
import { ShiftsModal } from "./ShiftsModal.js";
import { formatDate } from "../../formatting/FormatDateTime.js"; 

const ViewShifts = ({shiftDetailsData}) => {
  const [shiftsData, setShiftsData] = useState(shiftDetailsData || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    setShiftsData(shiftDetailsData || []);
  }, [shiftDetailsData]);

  const handleRosterClick = (shift) => {
    setSelectedShift(shift);
    setIsRosterModalOpen(true);
  }
  
  const handleEditRequestClick = (shift) => {
    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleCancelRequestClick = (shift) => {
    setSelectedShift(shift);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (shiftToCancel) => {
    // Add API call to cancel the shift
    setShiftsData((prevData) => prevData.filter((shift) => shift._id !== shiftToCancel._id));
    setIsCancelModalOpen(false);
  };

  const handleSaveEdit = (updatedShift) => {
    console.log("Updated Shift:", updatedShift);
    const updatedShifts = shiftsData.map((shift) =>
      shift._id === updatedShift._id ? updatedShift : shift
    );

    console.log("Updated Shifts:", updatedShifts);
    setShiftsData(updatedShifts);
    setIsEditModalOpen(false);
  };

  const shiftsGroupedByDate = shiftsData.reduce((acc, shift) => {
    const timestamp = shift.shift_start; // Use original timestamp as key
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsGroupedByDate).sort(
    (a, b) => new Date(a) - new Date(b) // Sort by original timestamps
  );

  return (
    <div className="upcoming-requests">
      {sortedDates.map((timestamp) => (
        <div key={timestamp} className="date-section">
          <div className="date-header">{formatDate(timestamp)}</div> {/* Format timestamp for display */}
          <div>
            {shiftsGroupedByDate[timestamp].map((shift) => (
              <ServiceShiftDetails
                key={shift._id}
                shift={shift}
                view={handleRosterClick}
                edit={handleEditRequestClick}
                cancel={handleCancelRequestClick} 
              />
            ))}
          </div>
        </div>
      ))}
      <ShiftsModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        shift={selectedShift}
      />
      <EditRequestModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShift}
        onSave={handleSaveEdit}
      />
      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        shift={selectedShift}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default ViewShifts;
