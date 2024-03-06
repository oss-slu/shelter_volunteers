import { useState, forwardRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../config";
import GraphComponent from "./GraphComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const IndividualShelter = (props) => {
  let shelter = props.shelter;
  const [startTime, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 1)
  );
  const [endTime, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), new Date().getHours() + 2)
  );
  const [shiftCounts, setShiftCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [volunteerCountsHidden, setVolunteerCountsHidden] = useState(true);


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
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button className="example-custom-input" onClick={(event) => {
      onClick(event); 
      setVolunteerCountsHidden(false);
    }} ref={ref}>
      {value}
    </button>
  ));


  function addShift() {
    if (props.addShiftFunction) {
      let id = shelter.id;
      let start = startTime.getTime();
      let end = endTime.getTime();
      let shift = {
        code: `${id}-${start}-${end}`,
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
    if (!volunteerCountsHidden && shelter) {
      setLoading(true);
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
            let startTime = new Date(shifts[i].start_time);
            let endTime = new Date(shifts[i].end_time);
            let prevBounds = start;
            if (i > 0) prevBounds = shifts[i - 1].end_time;
            if (prevBounds !== shifts[i].start_time) {
              newShifts.push({
                start_time: prevBounds,
                end_time: shifts[i].start_time,
                count: 0,
              });
            }
            if (
              !(
                startTime.getHours() === endTime.getHours() &&
                startTime.getMinutes() === endTime.getMinutes()
              )
            )
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
        .then((response) => {
          setShiftCounts(response);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    }
  }, [startTime, volunteerCountsHidden, shelter]);

  return (
    <div>
      {props.isSignupPage && (
        <div key={shelter.id}>
          <div className="signupcard">
            <div className="column1">
              <h2>{shelter.name}</h2>
              <p>
                {shelter.city}, {shelter.state} {shelter.zipCode}
              </p>
              <p>
                {shelter.phone}
              </p>
              <a href={shelter.website}>{shelter.website}</a>
              <p>{+shelter.distance.toFixed(2)} miles away</p>
              
              <button className="current-volunteer-count" onClick={() => setVolunteerCountsHidden(!volunteerCountsHidden)}>
                {volunteerCountsHidden ? "View Current Volunteer Counts  " : "Hide Current Volunteer Counts  "}
                <FontAwesomeIcon icon={volunteerCountsHidden ? faChevronDown : faChevronUp} size="lg"/>
              </button>
            </div>
            <div className="column2">
              <div className="dates">
                <div className="date-row">
                  <div className="date-label">
                    <p>Start Time: </p>
                  </div>
                  <div className="picker">
                    <DatePicker
                      className="date-picker"
                      selected={startTime}
                      filterTime={filterPastStartTime}
                      onChange={(date) => modifyStart(date)}
                      showTimeSelect
                      dateFormat="M/dd/yy hh:mm aa"
                      minDate={new Date()}
                      showDisabledMonthNavigation
                      customInput={<ExampleCustomInput />}
                    />
                  </div>
                </div>
                <div className="date-row">
                  <div className="date-label">
                    <p>End Time: </p>
                  </div>
                  <div className="picker">
                    <DatePicker
                      selected={endTime}
                      filterTime={filterPastEndTime}
                      onChange={(date) => modifyEnd(date)}
                      showTimeSelect
                      dateFormat="M/dd/yy hh:mm aa"
                      minDate={new Date()}
                      showDisabledMonthNavigation
                      customInput={<ExampleCustomInput />}
                    />
                  </div>
                </div>
              </div>
              <div className="add-btn">
                <button onClick={() => addShift()}>
                  <FontAwesomeIcon icon={faCirclePlus} size="1x" />
                  <p className="label">Add shift </p>
                </button>
              </div>
            </div>
          </div>

          {!volunteerCountsHidden && (
            <div className="signupcard shift-graph text-center">
              <h3>Current Volunteer Counts</h3>
              <div className="shift-count">
                {!loading && shiftCounts && shiftCounts.length > 0 && (
                  <div>{<GraphComponent shifts={shiftCounts} />}</div>
                )}
                {!loading && shiftCounts && shiftCounts.length === 0 && (
                  <p>
                    No volunteers are currently signed up during your selected
                    time range.
                  </p>
                )}
                {loading && <p>Loading...</p>}
              </div>
            </div>
          )}
        </div>
      )}
      {!props.isSignupPage && (
        <div className="shelter text-center" key={shelter.id}>
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
