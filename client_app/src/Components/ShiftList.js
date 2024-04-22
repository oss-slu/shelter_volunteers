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
    <>
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
                <div className={endTime.getTime() < Date.now() ? "shift past" : "shift upcoming"}>
                  {props.fromShelter === true && (
                    <div className="text-right">
                      <input
                        type="checkbox"
                        id={"shift-checkbox-" + shift.code}
                        onClick={onCheckboxClick}
                      />
                    </div>
                  )}
                  {props.fromShelter !== true && (
                    <div>
                      <h2>{shift.facility_info.name}</h2>
                      <p>
                        {shift.facility_info.city}, {shift.facility_info.state},
                        {shift.facility_info.zipCode}
                      </p>
                      <p>{shift.facility_info.phone}</p>
                      <p>
                        <a href={shift.facility_info.website}>{shift.facility_info.website}</a>
                      </p>
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
