import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../config";
import GraphComponent from "./GraphComponent";

const IndividualShelter = (props) => {
  let shelter = props.shelter;
  const [startTime, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 1)
  );
  const [endTime, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 2)
  );
  const [shiftCounts, setShiftCounts] = useState([]);

  const filterPastStartTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  const filterPastEndTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    currentDate.setHours(currentDate.getHours() + 1);
    return currentDate.getTime() < selectedDate.getTime();
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
        .then((shifts) => {
          let newShifts = [];
          for (let i = 0; i < shifts.length; i++) {
            let prevBounds = start;
            if (i > 0) prevBounds = shifts[i - 1].end_time;
            if (prevBounds !== shifts[i].start_time) {
              newShifts.push({
                start_time: prevBounds,
                end_time: shifts[i].start_time,
                count: 0,
              });
            }
            newShifts.push(shifts[i]);
            if (i === shifts.length - 1) {
              if (end !== shifts[i].end_time) {
                newShifts.push({
                  start_time: shifts[i].end_time,
                  end_time: end,
                  count: 0,
                });
              }
            }
          }
          return newShifts;
        })
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
          <div class="signupcard shift-graph text-center">
            <h3>Shift Counts for Time Ranges</h3>
            <div class="shift-count">
              {shiftCounts && <div>{GraphComponent(shiftCounts)}</div>}
              {shiftCounts.length === 0 && (
                <p>There are no shifts during your selected time range.</p>
              )}
            </div>
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
