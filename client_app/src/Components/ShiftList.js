import { format } from "date-fns";

const ShiftList = (props) => {
  function onCheckboxClick(event) {
    if (props.onCheck) {
      props.onCheck(event);
    }
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
    <div>
      {/* Display the shift*/}
      {props.shifts &&
        props.shifts.map((shift) => {
          const startTime = new Date(shift.start_time);
          const endTime = new Date(shift.end_time);

          // format the start and end time to human-readable strings
          const formattedStartTime = format(startTime, "M/dd/yy HH:mm");
          const formattedEndTime = format(endTime, "M/dd/yy HH:mm");
          // helps keep track of whether or not the end time of the shift is in the past
          const isPastShift = endTime.getTime() < Date.now();
          return (
            <>
            {props.currentSelectionSection === true && (<div className= "currentselection"
              key={shift.code}>
                <table>
                  <tr>
                    <td><p>{shift.shelter}</p></td>
                    <td><p>
                      {formattedStartTime} to {formattedEndTime}</p></td>
                    <td>
                      <button 
                        className="closebtn"
                        id={"shift-closebtn-" + shift.code}
                        onClick={onCloseBtnClick}
                        >X</button></td>
                  </tr>
                </table>

            </div>)}
            {props.currentSelectionSection !== true && (<div
              className={
                endTime.getTime() < Date.now() ? "shift past" : "shift upcoming"
              }
              key={shift.code}
            >
              {props.fromShelter === true && (
                <div class="text-right">
                  <input
                    type="checkbox"
                    id={"shift-checkbox-" + shift.code}
                    onClick={onCheckboxClick}
                  />
                </div>
              )}
              {props.fromShelter !== true && (
                <div>
                  <h2>{shift.shelter}</h2>
                </div>
              )}
              <p>
                {" "}
                {formattedStartTime} - {formattedEndTime}{" "}
              </p>
              {/* using the newly created boolean variable to ensure the cancel button only appears for
              upcoming shifts */}
              {!isPastShift && (
                <button className="cancelbtn" onClick={() => onCancelShiftClick(shift.code)}>
                  Cancel Shift
                </button>
              )}
            </div>)}
            </>
          );
        })}
      {props.shifts.length === 0 && !props.currentSelectionSection &&(
        <p className="text-center">
          You do not have any shifts in this category.
        </p>
      )}
      {props.shifts.length === 0 && props.currentSelectionSection &&(
        <p className="text-center">
          Please add your desired shifts from the list
        </p>
      )}
    </div>
  );
};

export default ShiftList;