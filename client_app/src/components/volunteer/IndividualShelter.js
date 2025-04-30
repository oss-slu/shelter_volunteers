import "react-datepicker/dist/react-datepicker.css";

const IndividualShelter = (props) => {
  let shelter = props.shelter;

  function addShift(shift) {
    if (props.addShiftFunction) {
      if (!shelter.shiftCounter) {
        shelter.shiftCounter = 0;
      }
      shelter.shiftCounter += 1;

      let newShift = {
        code: `${shift.id}-${shelter.shiftCounter}`,
        shelter: shelter.name,
        shelter_id: shelter._id,
        start_time: shift.shift_start,
        end_time: shift.shift_end,
        title: shift.title,
        id: shift.id, // added for tracking selected shift
        key: `${shift.id}-${shift.shift_start}`, // add key
      };
      props.addShiftFunction(newShift);
    }
  }

  const formatAddress = (address) => {
    return (
      <>
        {address.street1}
        {address.street2 && `, ${address.street2}`}
        <br />
        {address.city}, {address.state} {address.postalCode}
      </>
    );
  };

  const formatShiftDate = (start, end) => {
    const options = {
      timeZone: "America/Chicago",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h12",
    };
    if (!start || !end || isNaN(new Date(start)) || isNaN(new Date(end))) {
      return "Invalid shift time";
    }
    if (new Date(start).toDateString() === new Date(end).toDateString()) {
      return `${new Date(start).toLocaleString("en-US", {
        ...options,
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} - ${new Date(end).toLocaleString("en-US", options)}`;
    } else {
      return `${new Date(start).toLocaleString("en-US", {
        ...options,
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} - ${new Date(end).toLocaleString("en-US", {
        ...options,
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`;
    }
  };

  return (
    <div>
      {props.isSignupPage && (
        <div key={shelter._id}>
          <div className="signupcard">
            <div className="column1">
              <h2>{shelter.name}</h2>
              <p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${shelter.address.street1}, ${shelter.address.street2 ? 
                      shelter.address.street2 + ', ' : ''}${shelter.address.city}, 
                      ${shelter.address.state} ${shelter.address.postalCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddress(shelter.address)}
                </a>
              </p>
            </div>
            <div className="column2">
              <div className="available-shifts">
                <h3>Available Shifts:</h3>
                {shelter.shifts && shelter.shifts.length > 0 ? (
                  shelter.shifts.map((shift) => {
                    const shiftKey = `${shift.id}-${shift.shift_start}`;
                    const isSelected = props.selectedShiftKeys?.includes(shiftKey);
                    return (
                      <div key={shift.id} style={{ marginBottom: "10px" }}>
                        <button
                          className="shift-button"
                          data-testid="add-button"
                          onClick={() => addShift(shift)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  fontWeight: "bold",
                                  border: "2px solid #0056b3",
                                }
                              : {}
                          }
                        >
                          {formatShiftDate(shift.shift_start, shift.shift_end)}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p>No available shifts.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!props.isSignupPage && (
        <div className="shelter text-center" key={shelter._id}>
          <h2>{shelter.name}</h2>
          <p>{formatAddress(shelter.address)}</p>
        </div>
      )}
    </div>
  );
};

export default IndividualShelter;
