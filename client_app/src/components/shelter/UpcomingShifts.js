import React, { useState } from "react";
import "../../styles/shelter/UpcomingRequests.css";
import { shiftDetailsData } from "./ShiftDetailsData.tsx";
import ServiceShiftDetails from "./ServiceShiftDetails.js";
import { EditRequestModal } from "./EditRequestModal.js";
import { CancelRequestModal } from "./CancelRequestModal.js";
import { ShiftsModal } from "./ShiftsModal.js";

const UpcomingShifts = () => {
  const [shiftsData, setShiftsData] = useState(shiftDetailsData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);


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
    console.log("Shift cancelled:", shiftToCancel);
    // Add API call to cancel the shift
    setShiftsData((prevData) => prevData.filter((shift) => shift._id !== shiftToCancel._id));
    setIsCancelModalOpen(false);
  };

  const handleSaveEdit = (updatedShift) => {
    const updatedShifts = shiftsData.map((request) => {
      if (request.date === selectedShift.date) {
        return {
          ...request,
          shifts: request.shifts.map((shift) =>
            shift === selectedShift ? updatedShift : shift
          ),
        };
      }
      return request;
    });

    setShiftsData(updatedShifts);
    setIsEditModalOpen(false);
  };

  const shiftsGroupedByDate = shiftsData.reduce((acc, shift) => {
    const date = new Date(shift.shift_start).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsGroupedByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div className="upcoming-requests">
      <h2>All Upcoming Requests</h2>
      {sortedDates.map((date) => (
        <div key={date} className="date-section">
          <div className="date-header">{date}</div>
          <div>
            {shiftsGroupedByDate[date].map((shift) => (
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

export default UpcomingShifts;
