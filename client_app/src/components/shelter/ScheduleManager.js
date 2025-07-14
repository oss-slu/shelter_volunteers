import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClock, faUsers, faCheck, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Calendar } from 'react-multi-date-picker';
import { DesktopShiftRow } from '../volunteer/DesktopShiftRow';
import { formatDate, formatTime } from '../../formatting/FormatDateTime';
import { scheduleAPI } from '../../api/schedule';
import { useCurrentDashboard } from '../../contexts/DashboardContext';
import {EditShift } from './EditShift'; 
import { use } from 'react';
function ShelterScheduleManager(){
  const { shelterId } = useParams(); // Extract from URL param
  const [selectedDates, setSelectedDates] = useState([]);
  const [tentativeSchedule, setTentativeSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ shiftTemplates, setShiftTemplates] = useState([]);
  const { currentDashboard } = useCurrentDashboard();
  const [ editingShift, setEditingShift ] = useState(null);

  useEffect(() => {
    // Fetch existing shifts when the component mounts
    const fetchShifts = async () => {
      const shifts = await scheduleAPI.getShifts(shelterId);
      setShiftTemplates(shifts);
      console.log('Fetched shifts:', shifts);
    };
    fetchShifts();
  }, []);

  const processShiftData = (shiftDate, shift) => {
    const shelter = currentDashboard.details;
    const startDate = formatDate(shiftDate);
    const startTime = formatTime(shift.shift_start);
    const endTime = formatTime(shift.shift_end);
    const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60));
    const canInteract = true; 
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      duration,
      canInteract
    };
  };

  const handleShiftToggle = (shift) => {
    setEditingShift(shift);
  };

  const generateTentativeSchedule = (dates) => {
    const schedule = {};
    
    if (!dates || dates.length === 0) return schedule;
    
    dates.forEach(dateObj => {
      const dateStr = formatDate(dateObj);
      console.log('Processing date:', dateStr);
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
      
      schedule[dateStr] = {
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shifts: shiftTemplates.map((shift, index) => ({
          ...shift,
          id: `${index}`,
          date: dateStr,
          assignedVolunteers: 0
        }))
      };
    });
    
    return schedule;
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates || []);
  };

  useEffect(() => {
    console.log('Selected Dates:', selectedDates);
    setTentativeSchedule(generateTentativeSchedule(selectedDates));
    console.log('Tentative Schedule:', tentativeSchedule);
    console.log('Tentative schedule length ', tentativeSchedule);
  }, [selectedDates]);

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one date');
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmSchedule = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Creating shifts for schedule:', tentativeSchedule);
    
    setIsLoading(false);
    setShowConfirmation(false);
    setSelectedDates([]);
    setTentativeSchedule({});
    
    alert('Shifts created successfully!');
  };

  const clearSelection = () => {
    setSelectedDates([]);
  };

  // Get today's date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closeModal = () => {
    setEditingShift(null);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="title-small">Select Dates To Open Shelter</h1>
      <div>
        <div>
          <Calendar
            multiple
            onlyShowInRangeDates={true}
            minDate={today}
            value={selectedDates}
            onChange={handleDateChange}
          />
        </div>              
        {selectedDates.length > 0 && (
          <div>
            <div>
              <span className="font-semibold text-blue-800">
                {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDates.slice(0, 5).map((dateObj, index) => {
                const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
                return (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                );
              })}
              {selectedDates.length > 5 && (
                <span className="text-blue-600 text-sm">+{selectedDates.length - 5} more</span>
              )}
            </div>
          </div>
        )}
        {/* Schedule Preview Section */}
        {Object.keys(tentativeSchedule).length > 0 && (
        <div>
          <h2> Selected Shifts </h2>
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
              {Object.entries(tentativeSchedule).map(([shiftDate, shifts]) => (
                shifts.shifts.map(shift => (
                  <DesktopShiftRow key={shift.id} shiftData={processShiftData(shiftDate, shift)} handleShiftToggle={handleShiftToggle} />
                ))
              ))}
            </tbody>
          </table>
        </div>
        )}
        {editingShift && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <EditShift
              shift={editingShift}
              onUpdate={close}
            />
          </div>
        </div>
      )}
        {/* Summary and Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          {selectedDates.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-blue-800">
                    <strong>{selectedDates.length}</strong> days selected
                  </span>
                  <span className="text-blue-600">
                    <strong>
                      {Object.values(tentativeSchedule).reduce((total, day) => total + day.shifts.length, 0)}
                    </strong> shifts to be created
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={clearSelection}
              disabled={selectedDates.length === 0}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedDates.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Shifts
            </button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Schedule Creation</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                You are about to create shifts for <strong>{selectedDates.length}</strong> day
                {selectedDates.length !== 1 ? 's' : ''}. This will generate{' '}
                <strong>
                  {Object.values(tentativeSchedule).reduce((total, day) => total + day.shifts.length, 0)}
                </strong> total shifts.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">Selected Dates:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.slice(0, 6).map((dateObj, index) => {
                    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
                    return (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    );
                  })}
                  {selectedDates.length > 6 && (
                    <span className="text-gray-600 text-sm">+{selectedDates.length - 6} more</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShelterScheduleManager;