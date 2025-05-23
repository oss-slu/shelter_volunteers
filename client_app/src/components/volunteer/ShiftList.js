import React, { useEffect } from "react";
import { format } from "date-fns";
import { Address } from "./Address";
const ShiftList = props => {

  useEffect(() => {
    // Check for overlaps every time the shifts change
    if (props.currentSelectionSection) {
      const overlapExists = props.shifts.some((shift, index) =>
      checkForOverlap(shift, props.shifts.filter((_, i) => i !== index))
    );
    props.setOverlaps(overlapExists);
    }
  }, [props.shifts]);

  function onCheckboxClick(event) {
    if (props.onCheck) {
      props.onCheck(event);
    }
  }

  function checkForOverlap(shift, otherShifts) {
    const shiftStartTime = new Date(shift.shift_start);
    const shiftEndTime = new Date(shift.shift_end);

    return otherShifts.some((otherShift) => {
      const otherShiftStartTime = new Date(otherShift.shift_start);
      const otherShiftEndTime = new Date(otherShift.shift_end);

      // Check if there is an overlap
      return (
        shiftStartTime < otherShiftEndTime && shiftEndTime > otherShiftStartTime
      );
    });
  }

  function onCloseBtnClick(event) {
    if (props.onClose) {
      props.onClose(event);
    }
  }
  // This function asks user to confirm the cancel action
  function onCancelShiftClick(shiftCode) {
    if (window.confirm("Are you sure you want to cancel this shift?")) {
      props.onCancelShift(shiftCode);
    }
  }

  return (
    <>
      {/* Display the shift*/}
      {props.shifts &&
        props.shifts.map((shift) => {
          const startTime = new Date(shift.shift_start);
          const endTime = new Date(shift.shift_end);

          // format the start and end time to human-readable strings
          const formattedStartTime = format(startTime, "M/dd/yy HH:mm");
          const formattedEndTime = format(endTime, "M/dd/yy HH:mm");

          const isOverlapping = checkForOverlap(
            shift,
            props.shifts.filter((s) => s !== shift)
          );
          // helps keep track of whether or not the end time of the shift is in the past
          const isPastShift = startTime.getTime() < Date.now();
          return (
            <div key={shift._id || shift.code}>
              {props.currentSelectionSection === true && (
                <div className="currentselection">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <p>{shift.shelter}</p>
                        </td>
                        <td>
                          <p>
                            {formattedStartTime} to {formattedEndTime}
                          </p>
                        </td>
                        <td>
                          {/* Mark shift as overlapping if it overlaps with another shift */}
                          {isOverlapping ? (
                            <p style={{ color: "red" }}>Overlapping</p>
                          ) : (
                            <p style={{ color: "green" }}>No Overlap</p>
                          )}
                        </td>
                        <td>
                          <button
                            className="closebtn"
                            id={"shift_closebtn_" + shift.code}
                            onClick={onCloseBtnClick}>
                            X
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {props.currentSelectionSection !== true && (
                <div className={isPastShift ? "shift past" : "shift upcoming"}>
                  {props.fromShelter === true && (
                    <div className="text-right">
                      <input
                        type="checkbox"
                        id={"shift-checkbox-" + shift.code}
                        onClick={onCheckboxClick}
                      />
                    </div>
                  )}
                  {props.fromShelter !== true &&  (
                    <div>
                      <h2>{shift.shelter.name}</h2>
                      <Address address={shift.shelter.address}/>
                    </div>
                  )}
                  <p>
                    {" "}
                    {formattedStartTime} - {formattedEndTime}{" "}
                  </p>
                  {/* using the newly created boolean variable to ensure the cancel button only appears for
              upcoming shifts */}
                  {!isPastShift && (
                    <button
                      className="cancelbtn"
                      data-testid="cancelbtn"
                      onClick={() => onCancelShiftClick(shift._id)}>
                      Cancel Shift
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      {props.shifts.length === 0 && !props.currentSelectionSection && (
        <p className="text-center">You do not have any shifts in this category.</p>
      )}
      {props.shifts.length === 0 && props.currentSelectionSection && (
        <p className="text-center">Please add your desired shifts from the list</p>
      )}
    </>
  );
};

export default ShiftList;
