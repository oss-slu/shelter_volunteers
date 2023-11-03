import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

const ShelterList = (props) => {
  let allShifts = [];
  const [checked, setChecked] = useState([]);
  const [startTime, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), 9),
  );
  const [endTime, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), 12),
  );
  useEffect(() => {
    if (props.manageShiftsFunction) {
      let selectedShifts = [];
      for (let i = 0; i < allShifts.length; i++) {
        if (checked.includes(allShifts[i].code)) {
          selectedShifts.push(allShifts[i]);
        }
      }
      props.manageShiftsFunction(selectedShifts);
    }
  }, [checked]);

  return (
    <div>
      <div>
        {/* Display the shelters*/}
        {props.shelters &&
          props.shelters
            .sort((a, b) => a.distance - b.distance)
            .map((shelter, index) => {
              if (
                props.loadingFunction &&
                index === props.shelters.length - 1
              ) {
                props.loadingFunction(false);
              }
              return (
                <div>
                  {props.isSignupPage && (<div class="signupcard" key={shelter.id}>
                      <div className="column1">
                        <h2>{shelter.name}</h2>
                        <p>
                          {shelter.city}, {shelter.state} {shelter.zipCode}
                        </p>
                        <p>{+shelter.distance.toFixed(2)} miles away</p>
                      </div>
                      <div className="column2">
                        <label>Start Time: </label>
                        <DatePicker
                          className="date-picker"
                          selected={startTime}
                          onChange={(date) => setStartDate(date)}
                          showTimeSelect
                          dateFormat="M/dd/yy h:mm aa"
                        />
                        <label>End Time: </label>
                        <DatePicker
                          selected={endTime}
                          onChange={(date) => setEndDate(date)}
                          showTimeSelect
                          dateFormat="M/dd/yy h:mm aa"
                        />
                        <button>Add to selection</button>
                      </div>
                  </div>)}
                  {!props.isSignupPage && (
                  <div class="shelter text-center" key={shelter.id}>
                    <h2>{shelter.name}</h2>
                    <p>
                      {shelter.city}, {shelter.state} {shelter.zipCode}
                    </p>
                    <p>{+shelter.distance.toFixed(2)} miles away</p>
                  </div>)}

                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ShelterList;
