import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../config";

const IndividualShelter = (props) => {
  let shelter = props.shelter;
  const [startTime, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 1)
  );
  const [endTime, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 2)
  );
  const [shiftCounts, setShiftCounts] = useState([]);

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

  useEffect(() => {
    let start = setMilliseconds(
      setSeconds(setMinutes(setHours(startTime, 0), 0), 0),
      0
    );
    let end = setMilliseconds(
      setSeconds(setMinutes(setHours(startTime, 23), 59), 59),
      999
    );
    if (shelter) {
      let request_endpoint =
        SERVER +
        `/counts/${
          shelter.id
        }?filter_start_after=${start.getTime()}&filter_end_before=${end.getTime()}`;
      fetch(request_endpoint, {
        methods: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "volunteer@slu.edu",
        },
      })
        .then((response) => response.json())
        .then((response) => setShiftCounts(response))
        .catch((error) => console.log(error));
    }
  }, [startTime, shelter]);

  return (
    <div>
      {props.isSignupPage && (
        <div key={shelter.id}>
          <div class="signupcard">
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
                onChange={(date) => modifyStart(date)}
                showTimeSelect
                dateFormat="M/dd/yy h:mm aa"
              />
              <br />
              <br />
              <label>End Time: </label>
              <DatePicker
                selected={endTime}
                onChange={(date) => modifyEnd(date)}
                showTimeSelect
                dateFormat="M/dd/yy h:mm aa"
              />
              <br />
              <br />
              <button onClick={() => addShift()}>Add to selection</button>
            </div>
          </div>
          <div class="signupcard shift-count">
            {shiftCounts &&
              shiftCounts.map((shift, index) => {
                return (
                  <div>
                    <p>{shift.count}</p>
                    <p>{shift.start_time}</p>
                  </div>
                );
              })}
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
