import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import setMilliseconds from "date-fns/setMilliseconds";
import { SERVER } from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const IndividualShelter = (props) => {
  let shelter = props.shelter;
  const [startTime] = useState(
    setHours(
      setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
      new Date().getHours() + 1,
    ),
  );

  const [shiftCounts, setShiftCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [volunteerCountsHidden, setVolunteerCountsHidden] = useState(true);
  
  const { v4: uuidv4 } = require("uuid");

  function addShift(shift) {
    if (props.addShiftFunction) {
      let id = shelter.id;
      let newShift = {
        code: `${uuidv4()}-${id}`,
        shelter: id,
        start_time: shift.start,
        end_time: shift.end,
        title: shift.title,
      };
      props.addShiftFunction(newShift);
    }
  }

  useEffect(() => {
    let start = setMilliseconds(setSeconds(setMinutes(setHours(startTime, 0), 0), 0), 0);
    let end = setMilliseconds(setSeconds(setMinutes(setHours(startTime, 23), 59), 59), 999);
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
              <p>{+shelter.distance.toFixed(2)} miles away</p>
              <button
                className="current-volunteer-count"
                onClick={() => setVolunteerCountsHidden(!volunteerCountsHidden)}>
                {volunteerCountsHidden ? "View Volunteer Counts" : "Hide Volunteer Counts"}
                <FontAwesomeIcon icon={volunteerCountsHidden ? faChevronDown : faChevronUp} size="lg" />
              </button>
            </div>
            <div className="column2">
              <div className="available-shifts">
                <h3>Available Shifts:</h3>
                {shelter.shifts && shelter.shifts.length > 0 ? (
                  shelter.shifts.map((shift) => (
                    <button key={shift.id} className="shift-button" onClick={() => addShift(shift)}>
                      {new Date(shift.start).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} - 
                      {new Date(shift.end).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                    </button>
                  ))
                ) : (
                  <p>No available shifts.</p>
                )}
              </div>
            </div>
          </div>
          {!volunteerCountsHidden && (
            <div className="signupcard shift-graph text-center">
              <h3>Current Volunteer Counts</h3>
              <div className="shift-count">
                {!loading && shiftCounts.length > 0 ? (
                  <div>{shiftCounts.map((shift) => <p key={shift.start_time}>{shift.count} volunteers</p>)}</div>
                ) : (
                  <p>No volunteers currently signed up.</p>
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
          <p>{+shelter.distance.toFixed(2)} miles away</p>
        </div>
      )}
    </div>
  );
};

export default IndividualShelter;
