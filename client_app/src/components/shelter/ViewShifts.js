import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../styles/shelter/UpcomingShifts.css";
import ServiceShiftDetails from "./ServiceShiftDetails.js";
import { EditRequestModal } from "./EditRequestModal.js";
import { CancelRequestModal } from "./CancelRequestModal.js";
import { formatDate } from "../../formatting/FormatDateTime.js";
import ShiftUserInfoDisplay from "./ShiftUserInfoDisplay";
import { serviceShiftAPI } from "../../api/serviceShift.js";

const ViewShifts = ({ shiftDetailsData }) => {
  const { shelterId } = useParams();
  const [shiftsData, setShiftsData] = useState(shiftDetailsData || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [errorToast, setErrorToast] = useState("");

  useEffect(() => {
    setShiftsData(shiftDetailsData || []);
  }, [shiftDetailsData]);

  useEffect(() => {
    if (!errorToast) {
      return undefined;
    }
    const timeoutId = setTimeout(() => setErrorToast(""), 4000);
    return () => clearTimeout(timeoutId);
  }, [errorToast]);

  const handleRosterClick = (shift) => {
    setSelectedShift(shift);
    setIsRosterModalOpen(true);
  };

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

  const handleSaveEdit = async (updatedShift) => {
    try {
      const patchPayload = {
        shift_start: updatedShift.shift_start,
        shift_end: updatedShift.shift_end,
        required_volunteer_count: updatedShift.required_volunteer_count,
        instructions: updatedShift.instructions || "",
      };

      const savedShift = await serviceShiftAPI.updateShift(
        shelterId,
        updatedShift._id,
        patchPayload,
      );
      const updatedShifts = shiftsData.map((shift) =>
        shift._id === savedShift._id ? { ...shift, ...savedShift } : shift,
      );

      setShiftsData(updatedShifts);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating shift:", error);
      setErrorToast(error?.message || "Failed to update shift. Please try again.");
      throw error;
    }
  };

  const shiftsGroupedByDate = shiftsData.reduce((acc, shift) => {
    const timestamp = formatDate(shift.shift_start);
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsGroupedByDate).sort((a, b) => a < b);

  // Sort shifts within each date by shift_start in ascending order
  Object.keys(shiftsGroupedByDate).forEach((date) => {
    shiftsGroupedByDate[date].sort((a, b) => a.shift_start - b.shift_start);
  });

  return (
    <div className="upcoming-requests">
      {errorToast && <div className="shift-toast">{errorToast}</div>}
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
                cancel={handleCancelRequestClick}
              />
            ))}
          </div>
        </div>
      ))}
      <ShiftUserInfoDisplay
        isOpen={isRosterModalOpen}
        onDismiss={() => setIsRosterModalOpen(false)}
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
