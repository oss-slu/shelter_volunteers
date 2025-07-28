import React, { useState, useEffect } from "react";
import "../../styles/shelter/UpcomingShifts.css";
import ServiceShiftDetails from "./ServiceShiftDetails.js";
import { EditRequestModal } from "./EditRequestModal.js";
import { ShiftsModal } from "./ShiftsModal.js";
import { formatDate } from "../../formatting/FormatDateTime.js"; 

const ViewShifts = ({shiftDetailsData}) => {
  const [shiftsData, setShiftsData] = useState(shiftDetailsData || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleSaveEdit = (updatedShift) => {
    const updatedShifts = shiftsData.map((shift) =>
      shift._id === updatedShift._id ? updatedShift : shift
    );

    setShiftsData(updatedShifts);
    setIsEditModalOpen(false);
  };

  const shiftsGroupedByDate = shiftsData.reduce((acc, shift) => {
    const timestamp = formatDate(shift.shift_start);
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsGroupedByDate).sort(
    (a, b) => a < b
  );

  // Sort shifts within each date by shift_start in ascending order
  Object.keys(shiftsGroupedByDate).forEach((date) => {
    shiftsGroupedByDate[date].sort((a, b) => a.shift_start - b.shift_start);
  });

  return (
    <div className="upcoming-requests">
      {sortedDates.map((timestamp) => (
        <div key={timestamp} className="date-section">
          <div className="date-header">{timestamp}</div>
          <div>
            {shiftsGroupedByDate[timestamp].map((shift) => (
              <ServiceShiftDetails
                key={shift._id}
                shift={shift}
                view={handleRosterClick}
                edit={handleEditRequestClick}
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
    </div>
  );
};

export default ViewShifts;
