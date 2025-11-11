import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { shelterAPI } from "../../api/shelter";
import { repeatableShiftsApi } from "../../api/repeatableShiftsApi";
import {
  displayTime,
  millisToTimeString,
  timeStringToMillis,
} from "../../formatting/FormatDateTime";
import loading from "../Loading";

const RepeatableShiftsScreen = () => {
  const { shelterId } = useParams();

  const [shelterName, setShelterName] = useState("");
  const [loadingShelterName, setLoadingShelterName] = useState(false);

  const [pendingShifts, setPendingShifts] = useState([]);
  const [currentShifts, setCurrentShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // Set shelter name.
  useEffect(() => {
    if (!shelterId) return;
    setLoadingShelterName(true);
    shelterAPI.getShelter(shelterId).then((shelter) => {
      setShelterName(shelter.name);
      setLoadingShelterName(false);
    });
    return () => setLoadingShelterName(false);
  }, [shelterId]);

  // Set initial repeatable shifts.
  useEffect(() => {
    if (!shelterId) return;
    setLoadingShifts(true);
    repeatableShiftsApi.getRepeatableShifts(shelterId).then((shifts) => {
      console.log(shifts);
      setPendingShifts(shifts);
      setCurrentShifts(shifts);
      setLoadingShifts(false);
    });
    return () => setLoadingShifts(false);
  }, [shelterId]);

  const submitShifts = () => {
    if (!shelterId) return;
    setLoadingShifts(true);
    repeatableShiftsApi
      .setRepeatableShifts(shelterId, pendingShifts)
      .then((shifts) => {
        setPendingShifts(shifts);
        setCurrentShifts(shifts);
      })
      .finally(() => {
        setLoadingShifts(false);
      });
  };

  const addNewShift = () => {
    setPendingShifts((shifts) => [
      ...shifts,
      {
        shiftName: "",
        shiftStart: 12 * 3600000,
        shiftEnd: 13 * 3600000,
        requiredVolunteerCount: 1,
        maxVolunteerCount: 5,
      },
    ]);
  };

  const updateShift = (index, field, value) => {
    console.log(value);
    setPendingShifts((shifts) => {
      const updatedShifts = [...shifts];
      if (field === "duration") {
        value = Math.max(value || 0, 0);
        updatedShifts[index]["shiftEnd"] = updatedShifts[index]["shiftStart"] + value * 3600000;
      } else {
        updatedShifts[index][field] = value;
      }
      return updatedShifts;
    });
  };

  const deleteShift = (index) => {
    setPendingShifts((shifts) => shifts.filter((_, i) => i !== index));
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2">
      <div>
        <h1 className="display-4">Repeatable Shifts</h1>
        <h2>
          Shelter: {loadingShelterName ? "Loading Shelter Name" : shelterName} ({shelterId})
        </h2>
      </div>
      <div className="card">
        <h1>Projected Repeatable Shifts</h1>
        {loadingShifts ? (
          <div>Loading shifts...</div>
        ) : (
          <div className="d-flex flex-column py-4">
            <table className="table table-striped table-responsive">
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Start Time</th>
                  <th>Duration (hours)</th>
                  <th>End Time</th>
                  <th>Required Volunteers</th>
                  <th>Max Volunteers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingShifts.map((shift, idx) => (
                  <tr key={shift.id}>
                    <td>
                      <input
                        type="text"
                        value={shift.shiftName}
                        placeholder="Shift Name"
                        onChange={(e) => updateShift(idx, "shiftName", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={millisToTimeString(shift.shiftStart)}
                        onChange={(e) =>
                          updateShift(idx, "shiftStart", timeStringToMillis(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={(shift.shiftEnd - shift.shiftStart) / 3600000}
                        onChange={(e) => updateShift(idx, "duration", e.target.value)}
                      />
                    </td>
                    <td>
                      <div>{displayTime(shift.shiftEnd)}</div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={shift.requiredVolunteerCount}
                        onChange={(e) => updateShift(idx, "requiredVolunteerCount", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={shift.maxVolunteerCount}
                        onChange={(e) => updateShift(idx, "maxVolunteerCount", e.target.value)}
                      />
                    </td>
                    <td>
                      <div>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => deleteShift(idx)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary w-25" type="button" onClick={addNewShift}>
              Add new shift
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn btn-primary w-100 btn-lg"
        disabled={loadingShifts}
        onClick={() => submitShifts()}>
        Submit Schedule
      </button>
    </div>
  );
};

export default RepeatableShiftsScreen;
