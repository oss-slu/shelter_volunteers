import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/shelter/RepeatableShifts.css";
import { scheduleAPI } from "../../api/schedule";
import { DesktopShiftRow } from "./DesktopShiftRow";
import { timeStringToMillis } from "../../formatting/FormatDateTime";
import { shelterAPI } from "../../api/shelter";
const RepeatableShifts = () => {
  const { shelterId } = useParams(); // grab the shelterId from URL

  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    requiredVolunteers: 1,
    maxVolunteers: 5,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingShelterInfo, setLoadingShelterInfo] = useState(false);
  const [shelterInfo, setShelterInfo] = useState(null);

  const shelterNameLabel = loadingShelterInfo
    ? "[Loading name...]"
    : (shelterInfo?.name ?? shelterId);

  // Get shelter info from ID.
  useEffect(() => {
    if (!shelterId) return;
    setLoadingShelterInfo(true);
    shelterAPI.getShelter(shelterId).then((shelter) => {
      setShelterInfo(shelter);
      setLoadingShelterInfo(false);
    });

    return () => {
      setLoadingShelterInfo(false);
    };
  }, [shelterId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift({ ...newShift, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newShift.startTime && newShift.duration) {
      const newEntry = {
        ...newShift,
        shift_start: timeStringToMillis(newShift.startTime),
        shift_end: timeStringToMillis(newShift.startTime) + newShift.duration * 60 * 60 * 1000,
      };
      setShifts([...shifts, newEntry]);
      setNewShift({
        shiftName: "",
        startTime: "",
        duration: "",
        requiredVolunteers: 1,
        maxVolunteers: 5,
      });
    }
  };

  const handleSubmitAllShifts = async () => {
    try {
      const transformedShifts = shifts.map((shift) => ({
        shift_name: shift.shiftName || "Unnamed Shift",
        shift_start: timeStringToMillis(shift.startTime),
        shift_end: timeStringToMillis(shift.startTime) + shift.duration * 60 * 60 * 1000,
        required_volunteer_count: Number(shift.requiredVolunteers),
        max_volunteer_count: Number(shift.maxVolunteers),
        shelter_id: shelterId,
      }));

      await scheduleAPI.submitRepeatableShifts(shelterId, transformedShifts);

      const updatedSchedule = await scheduleAPI.getShifts(shelterId);
      console.log("Updated schedule from backend:", updatedSchedule);

      setSuccessMessage("Schedule submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShifts([]);
    } catch (error) {
      console.error("Error submitting schedule:", error);
      alert("There was an error submitting the schedule.");
    }
  };

  const updateShift = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  const deleteShift = (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    setShifts(updatedShifts);
  };

  return (
    <div className="repeatable-shifts-page">
      <h2>Define Repeatable Shifts for Shelter {shelterNameLabel}</h2>
      <p className="instructions">
        Define the repeatable shifts below. Once you've added all your shifts, click "Submit
        Schedule" to save them.
      </p>
      <form onSubmit={handleSubmit} className="shift-form">
        <label>
          Shift Name (optional):
          <input
            type="text"
            name="shiftName"
            value={newShift.shiftName}
            onChange={handleInputChange}
            placeholder="e.g., Morning Shift"
          />
        </label>
        <label>
          Start Time:
          <input
            type="time"
            name="startTime"
            value={newShift.startTime}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Duration (in hours):
          <input
            type="number"
            name="duration"
            value={newShift.duration}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Required Volunteers:
          <input
            type="number"
            name="requiredVolunteers"
            value={newShift.requiredVolunteers}
            onChange={handleInputChange}
            min="1"
          />
        </label>
        <label>
          Max Volunteers:
          <input
            type="number"
            name="maxVolunteers"
            value={newShift.maxVolunteers}
            onChange={handleInputChange}
            min="1"
          />
        </label>
        <button type="submit" className="submit-button">
          Add Shift
        </button>
      </form>
      <div>
        <h3>Current Repeatable Shifts</h3>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          <>
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Start Time</th>
                  <th>Duration (hours)</th>
                  <th>End Time</th>
                  <th>Required Volunteers</th>
                  <th>Max Volunteers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, index) => (
                  <DesktopShiftRow
                    key={index}
                    index={index}
                    shift={shift}
                    updateShift={updateShift}
                    deleteShift={deleteShift}
                  />
                ))}
              </tbody>
            </table>
            <button className="submit-button" onClick={handleSubmitAllShifts}>
              Submit Schedule
            </button>
          </>
        )}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
};

export default RepeatableShifts;
