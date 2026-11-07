import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { shelterAPI } from "../../api/shelter";
import { repeatableShiftsApi } from "../../api/repeatableShiftsApi";
import {
  millisToTimeString,
  timeStringToMillis,
} from "../../formatting/FormatDateTime";
import { dedupeRepeatableShifts } from "../../utils/repeatableShiftDeduplication";
import "../../styles/shelter/RepeatableShiftsScreen.css";

const MAX_INSTRUCTIONS_LENGTH = 500;

const RepeatableShiftsScreen = () => {
  const { shelterId } = useParams();

  const [shelterName, setShelterName] = useState("");
  const [loadingShelterName, setLoadingShelterName] = useState(false);

  const [errorMessages, setErrorMessages] = useState([]);

  const [pendingShifts, setPendingShifts] = useState([]);
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
      setPendingShifts(dedupeRepeatableShifts(shifts));
      setLoadingShifts(false);
    });
    return () => setLoadingShifts(false);
  }, [shelterId]);

  const submitShifts = () => {
    if (!shelterId) return;
    setLoadingShifts(true);
    const dedupedPendingShifts = dedupeRepeatableShifts(pendingShifts);
    repeatableShiftsApi
      .setRepeatableShifts(shelterId, dedupedPendingShifts)
      .then((shifts) => {
        setPendingShifts(dedupeRepeatableShifts(shifts));
        setErrorMessages([]);
      })
      .catch((data) => {
        const errors = ["Fix form errors and try again.", ...data.generic_errors];
        Object.keys(data.keyed_errors).forEach((key) => {
          const idx = Number.parseInt(key) + 1;
          Object.keys(data.keyed_errors[key]).forEach((field) => {
            for (let error of data.keyed_errors[key][field]) {
              errors.push("Shift " + idx + ": " + error);
            }
          });
        });
        setErrorMessages(errors);
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
        instructions: "",
        instructionsRecurring: false,
      },
    ]);
  };

  const updateShift = (index, field, value) => {
    setPendingShifts((shifts) => {
      const updatedShifts = [...shifts];
      updatedShifts[index][field] = value;
      return updatedShifts;
    });
  };

  const deleteShift = (index) => {
    setPendingShifts((shifts) => shifts.filter((_, i) => i !== index));
  };

  const shelterLabel = loadingShelterName ? "this shelter" : shelterName || "this shelter";
  const hasShifts = pendingShifts.length > 0;

  return (
    <div className="repeatable-shifts-screen">
      <header className="repeatable-shifts-header">
        <h1 className="page-title">Repeatable Shifts</h1>
        <p className="repeatable-shifts-subtitle">
          The daily schedule used every time <strong>{shelterLabel}</strong> opens.
        </p>
      </header>
      {errorMessages.length > 0 && (
        <div className="alert alert-danger repeatable-shifts-errors" role="alert">
          <ul className="mb-0">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <section className="repeatable-shifts-card" aria-labelledby="repeatable-shifts-title">
        <div className="repeatable-shifts-card-header">
          <div>
            <h2 id="repeatable-shifts-title" className="repeatable-shifts-card-title">
              Projected Repeatable Shifts
            </h2>
            {!loadingShifts && (
              <p className="repeatable-shifts-count">
                {pendingShifts.length} {pendingShifts.length === 1 ? "shift" : "shifts"} per day
              </p>
            )}
          </div>
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={addNewShift}
            disabled={loadingShifts}>
            + Add shift
          </button>
        </div>
        {loadingShifts ? (
          <p className="repeatable-shifts-empty">Loading shifts…</p>
        ) : !hasShifts ? (
          <p className="repeatable-shifts-empty">
            No repeatable shifts yet. Add the first shift to build your daily schedule.
          </p>
        ) : (
          <div className="repeatable-shifts-table-wrap">
            <table className="table repeatable-shifts-table">
              <thead>
                <tr>
                  <th className="col-index">#</th>
                  <th>Shift name</th>
                  <th>Start time</th>
                  <th>Duration (h)</th>
                  <th>End time</th>
                  <th>Required</th>
                  <th>Max</th>
                  <th className="col-instructions">Shelter instructions</th>
                  <th className="text-center">Recurring</th>
                  <th className="text-end">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingShifts.map((shift, idx) => (
                  <tr key={shift.id || `new-${idx}`}>
                    <td className="col-index">{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={shift.shiftName}
                        placeholder="Shift Name"
                        onChange={(e) => updateShift(idx, "shiftName", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control"
                        value={millisToTimeString(shift.shiftStart)}
                        onChange={(e) =>
                          updateShift(idx, "shiftStart", timeStringToMillis(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        value={(shift.shiftEnd - shift.shiftStart) / 3600000}
                        aria-label={`Duration in hours (shift ${idx + 1})`}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control"
                        value={millisToTimeString(shift.shiftEnd)}
                        onChange={(e) =>
                          updateShift(idx, "shiftEnd", timeStringToMillis(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={shift.requiredVolunteerCount}
                        onChange={(e) =>
                          updateShift(
                            idx,
                            "requiredVolunteerCount",
                            Number.parseInt(e.target.value),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={shift.maxVolunteerCount}
                        onChange={(e) =>
                          updateShift(idx, "maxVolunteerCount", Number.parseInt(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={shift.instructions || ""}
                        maxLength={MAX_INSTRUCTIONS_LENGTH}
                        placeholder="Enter entry instructions, items to bring, parking info, etc."
                        onChange={(e) => updateShift(idx, "instructions", e.target.value)}
                      />
                      <small className="repeatable-shifts-char-count">
                        {(shift.instructions || "").trim().length}/{MAX_INSTRUCTIONS_LENGTH}
                      </small>
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input repeatable-shifts-checkbox"
                        checked={Boolean(shift.instructionsRecurring)}
                        onChange={(e) =>
                          updateShift(idx, "instructionsRecurring", e.target.checked)
                        }
                        aria-label={`Copy instructions to every generated shift (shift ${idx + 1})`}
                        title="When enabled, instructions are copied to every generated shift."
                      />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteShift(idx)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="repeatable-shifts-card-footer">
          <p className="repeatable-shifts-footer-note">
            Edits are not saved until you submit the schedule.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loadingShifts}
            onClick={() => submitShifts()}>
            Submit schedule
          </button>
        </div>
      </section>
    </div>
  );
};

export default RepeatableShiftsScreen;
