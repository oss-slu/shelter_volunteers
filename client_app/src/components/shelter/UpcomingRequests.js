import React, { useState } from "react";
import "../../styles/shelter/UpcomingRequests.css";
import { upcomingRequestsData } from "./UpcomingRequests.tsx";
import { EditRequestModal } from "./EditRequestModal";
import { CancelRequestModal } from "./CancelRequestModal";
import { NotifyVolunteersModal } from './NotifyFrequentVolunteersModal';

const UpcomingRequests = () => {
  const [shiftsData, setShiftsData] = useState(upcomingRequestsData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
  const handleNotifyVolunteersClick = (shift) => {
    setSelectedShift(shift);
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = (message) => {
    console.log("Notification message sent to frequent volunteers:", message);
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
    const updatedShifts = shiftsData.map((request) => {
      if (request.date === shiftToCancel.date) {
        return {
          ...request,
          shifts: request.shifts.filter((shift) => shift !== shiftToCancel),
        };
      }
      return request;
    });
    setShiftsData(updatedShifts);
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

  return (
    <div className="upcoming-requests">
      <h2>All Upcoming Requests</h2>
      {upcomingRequestsData.map((request, index) => (
        <div key={index} className="date-section">
          <div className="date-header">{request.date}</div>
          <div className="shift-table">
            <div className="shift-table-header">
              <span>From Time</span>
              <span>To Time</span>
              <span>Number of Volunteers Requested</span>
              <span></span>
            </div>
            {request.shifts.map((shift, shiftIndex) => (
              <div key={shiftIndex} className="shift-row">
                <div className="shift-time">{shift.fromTime}</div>
                <div className="shift-time">{shift.toTime}</div>
                <div className="volunteers-requested">{shift.volunteersRequested}</div>
                <div className="actions">
                  <button onClick={() => handleEditRequestClick(shift)}>Edit Request</button>
                  <button onClick={() => handleCancelRequestClick(shift)}>Cancel Request</button>
                  <button onClick={() => handleNotifyVolunteersClick(shift)}>Notify Frequent Volunteers</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
      <NotifyVolunteersModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        onNotify={handleSendNotification}
      />
    </div>
  );
};

export default UpcomingRequests;
