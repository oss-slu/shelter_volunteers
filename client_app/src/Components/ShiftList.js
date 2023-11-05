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
  return (
    <div>
      {/* Display the shift*/}
      {props.shifts &&
        props.shifts.map((shift) => {
          const startTime = new Date(shift.start_time);
          const endTime = new Date(shift.end_time);

          // format the start and end time to human-readable strings
          const formattedStartTime = format(startTime, "MMMM dd, yyyy HH:mm");
          const formattedEndTime = format(endTime, "MMMM dd, yyyy HH:mm");
          return (
            <>
            {props.currentSelectionSection === true && (<div className= "currentselection"
              key={shift.code}>
                <table>
                  <tr>
                    <td><p>{shift.shelter}</p></td>
                    <td><p>{formattedStartTime} to {formattedEndTime}</p></td>
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
            </div>)}
            </>
          );
        })}
      {props.shifts.length === 0 && (
        <p className="text-center">
          You do not have any shifts in this category.
        </p>
      )}
    </div>
  );
};

export default ShiftList;
