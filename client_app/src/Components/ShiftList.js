import { format } from "date-fns";

const ShiftList = (props) => {
  console.log(props.shifts);
  console.log(typeof props.shifts);
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
            <div class="shift text-center" key={shift.code}>
              <div class="text-right">
                <input type="checkbox" id={"shift-checkbox-" + shift.code} />
              </div>
              <h2>{shift.shelter}</h2>
              <p>{shift.worker}</p>
              <p>
                {" "}
                {formattedStartTime} - {formattedEndTime}{" "}
              </p>
              <hr />
            </div>
          );
        })}
    </div>
  );
};

export default ShiftList;
