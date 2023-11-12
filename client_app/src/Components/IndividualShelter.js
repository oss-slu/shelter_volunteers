import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

const IndividualShelter = (props) => {
  let shelter = props.shelter;
  const [startTime, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 1)
  );
  const [endTime, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 2)
  );

    const filterPastStartTime = (time) => {
      const currentDate = new Date();
      const selectedDate = new Date(time);
      return  currentDate.getTime() < selectedDate.getTime();
      };
        
    const filterPastEndTime = (time) => {
       const currentDate = new Date();
       const selectedDate = new Date(time);
       currentDate.setHours(currentDate.getHours() + 1);
       return  currentDate.getTime() < selectedDate.getTime();
       };
    
  function addShift() {
    if (props.addShiftFunction) {
      let id = shelter.id;
      let start = startTime.getTime();
      let end = endTime.getTime();
      let shift = {
        code: `${id}-${start}-${end}`,
        worker: "volunteer@slu.edu",
        shelter: id,
        start_time: start,
        end_time: end,
      };
      props.addShiftFunction(shift);
    }
  }

  function modifyStart(date) {
    if (endTime.getTime() <= date) {
      setEndDate(setHours(date, date.getHours() + 1));
    }
    setStartDate(date);
  }

  function modifyEnd(date) {
    if (startTime.getTime() >= date) {
      setEndDate(setHours(date, date.getHours() + 1));
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  }

  return (
    <div>
      {props.isSignupPage && (
        <div class="signupcard" key={shelter.id}>
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
              filterTime={filterPastStartTime}
              onChange={(date) => modifyStart(date)}
              showTimeSelect
              dateFormat="M/dd/yy h:mm aa"
              minDate={new Date()}
              showDisabledMonthNavigation
            />
            <br />
            <br />
            <label>End Time: </label>
            <DatePicker
              selected={endTime}
              filterTime={filterPastEndTime}
              onChange={(date) => modifyEnd(date)}
              showTimeSelect
              dateFormat="M/dd/yy h:mm aa"
              minDate={new Date()}
              showDisabledMonthNavigation
            />
            <br />
            <br />
            <button onClick={() => addShift()}>Add to selection</button>
          </div>
        </div>
      )}
      {!props.isSignupPage && (
        <div class="shelter text-center" key={shelter.id}>
          <h2>{shelter.name}</h2>
          <p>
            {shelter.city}, {shelter.state} {shelter.zipCode}
          </p>
          <p>{+shelter.distance.toFixed(2)} miles away</p>
        </div>
      )}
    </div>
  );
};

export default IndividualShelter;
