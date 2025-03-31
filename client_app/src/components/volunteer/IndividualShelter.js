import "react-datepicker/dist/react-datepicker.css";

const IndividualShelter = (props) => {
  let shelter = props.shelter;

  function addShift(shift) {
    if (props.addShiftFunction) {
      let id = shelter.id;
      let newShift = {
        code: shift._id + "-" + shelter._id,
        shelter: id,
        start_time: shift.shift_start,
        end_time: shift.shift_end,
        title: shift.title,
        shelter_name: shelter.name,
      };
      props.addShiftFunction(newShift);
    }
  }

  return (
    <div>
      {props.isSignupPage && (
        <div key={shelter.id}>
          <div className="signupcard">
            <div className="column1">
              <h2>{shelter.name}</h2>
              <p>{"Show address here"}</p>
            </div>
            <div className="column2">
              <div className="available-shifts">
                <h3>Available Shifts:</h3>
                {shelter.shifts && shelter.shifts.length > 0 ? (
                  shelter.shifts.map((shift) => (
                    <div key={shift._id} style={{ marginBottom: "10px" }}> {/* Added div for spacing */}
                      <button 
                        className="shift-button" 
                        data-testid="add-button" 
                        onClick={() => addShift(shift)}
                      >
                        {new Date(shift.shift_start).toLocaleString("en-US", { 
                          timeZone: "America/Chicago", 
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hourCycle: "h23"
                        })} -
                        {new Date(shift.shift_end).toLocaleString("en-US", { 
                          timeZone: "America/Chicago", 
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hourCycle: "h23"
                        })}
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No available shifts.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!props.isSignupPage && (
        <div className="shelter text-center" key={shelter.id}>
          <h2>{shelter.name}</h2>
        </div>
      )}
    </div>
  );
};

export default IndividualShelter;
