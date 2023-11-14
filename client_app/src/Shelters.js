import { useState, useEffect } from "react";
import ShelterList from "./Components/ShelterList";
import ConfirmationPage from "./Components/ConfirmationPage";
import { SERVER } from "./config";
import { Link } from "react-router-dom";
import ShiftList from "./Components/ShiftList";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays,faArrowRight,faCircleXmark } from '@fortawesome/free-solid-svg-icons'



const Shelters = (props) => {
  let defaultRadius = "10";
  if (props.condensed) defaultRadius = "25";
  const [data, setData] = useState([]);
  const [latitude, setLatitude] = useState(41.8781);
  const [longitude, setLongitude] = useState(-87.6298);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(true);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [onMobileContinueclicked,setOnMobileContinueclicked]=useState(false);

  let shelters_endpoint =
    "https://api2-qa.gethelp.com/v2/facilities?page=0&pageSize=1000";
  let volunteers_endpoint = "https://api2-qa.gethelp.com/volunteers/";

  useEffect(() => {
    setLoading(true);
    let new_endpoint =
      shelters_endpoint +
      "&latitude=" +
      latitude.toString() +
      "&longitude=" +
      longitude.toString() +
      "&radius=" +
      radius.toString();
    fetch(new_endpoint, {
      methods: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => (await response.json())["content"])
      .then((shelters) => {
        if (props.condensed) {
          shelters = shelters.slice(0, 3);
        }
        return shelters;
      })
      .then((shelters) => setData(shelters))
      .catch((error) => console.log(error));
  }, [
    latitude,
    longitude,
    radius,
    shelters_endpoint,
    volunteers_endpoint,
    props.condensed,
  ]);

  function getLocation() {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  }

  function onShiftClose(event) {
    let id = event.target.id;
    let shift =
      id.split("-")[2] + "-" + id.split("-")[3] + "-" + id.split("-")[4];
    
    const codes = selectedShifts.map((s) => s.code);
    if (codes.includes(shift)) {
      let index = selectedShifts.findIndex((s) => s.code === shift)
      if (index !== -1) {
        const newSelected = [...selectedShifts];
        newSelected.splice(index, 1);
        setSelectedShifts(newSelected);
        setButtonDisabled(selectedShifts.length === 0);
      }
    }
  }

  function setLocation(location) {
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  function setRadiusfromLocation(event) {
    setRadius(event.target.value);
  }

  function manageShifts(shift) {
    setSelectedShifts([...selectedShifts, shift]);
    setButtonDisabled(selectedShifts.length === 0);
  }

  function submitShifts() {
    let shifts = selectedShifts;
    const shiftsEndpoint = SERVER + "/shifts";
    fetch(shiftsEndpoint, {
      method: "POST",
      body: JSON.stringify(shifts),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: "volunteer@slu.edu",
      },
    })
      .then(() => setShowConfirmation(true))
      .catch((error) => console.log(error));
  }

  function onMobileContinueClick(){
    if (selectedShifts.length<1) {
      return
    }
    setOnMobileContinueclicked(true);
  }
  function handleCurrentSelectionClose(){
    setOnMobileContinueclicked(false);
  }

  useEffect(() => {
    setButtonDisabled(selectedShifts.length === 0);
  }, [selectedShifts]);

  return (
    <>
      {!showConfirmation && (
        <div>
          {props.condensed && (
            <div className="text-center">
              <button onClick={getLocation}>
                Get Shelters from Current Location
              </button>
              <ShelterList
                shelters={data}
                loadingFunction={setLoading}
                manageShiftsFunction={manageShifts}
                isSignupPage={false}
              />
              <div class="text-center">
                <Link to="/shelters">
                  <button>View All Shelters</button>
                </Link>
              </div>
            </div>
          )}
          {!props.condensed && (
            <div>
              <div className="signup-page">
                <div className="column column-1">
                  <div className="text-center">
                    <h1>Volunteering Oppotunities</h1>
                    <button onClick={getLocation}>
                      Show oppotunities near me
                    </button>
                    <br />
                    <label htmlFor="radius-select">Radius (miles): </label>
                    <select id="radius-select" onChange={setRadiusfromLocation}>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  {loading && <div class="loader"></div>}
                  <ShelterList
                    shelters={data}
                    loadingFunction={setLoading}
                    manageShiftsFunction={manageShifts}
                    isSignupPage={true}
                  />
                </div>
                <div className="column column-2">
                  <div className={onMobileContinueclicked?"current-selection active":"current-selection"}>
                    <h2>Current Selection</h2>
                    {onMobileContinueclicked&&(
                      <div className="close-btn" onClick={handleCurrentSelectionClose}>
                        <FontAwesomeIcon icon={faCircleXmark} size="2x" />
                      </div>
                    )}
                    {selectedShifts && (
                      <div>
                        <ShiftList
                          shifts={selectedShifts}
                          currentSelectionSection={true}
                          onClose={onShiftClose}
                        />
                      </div>
                    )}
                    <div id="submit-shifts">
                      <button
                        onClick={submitShifts}
                        disabled={isButtonDisabled}
                      >
                        Submit Shifts
                      </button>
                    </div>
                  </div>
                </div>
                <div className="continue-bottom-row">
                  <div className="cart" onClick={onMobileContinueClick}>
                    <div className="circle">
                      <FontAwesomeIcon icon={faCalendarDays} size="2x"/>
                    </div>
                    <div className="count-bubble">
                        {selectedShifts.length}
                    </div>
                  </div>
                  <button className={selectedShifts.length>0?"cont-btn":"cont-btn disabled"} onClick={onMobileContinueClick}>
                    Continue 
                    {selectedShifts.length>0 && (<FontAwesomeIcon icon={faArrowRight} style={{"marginLeft":"1em"}}/>)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showConfirmation && (
        <div>
          <ConfirmationPage selectedShifts={selectedShifts} />
        </div>
      )}
    </>
  );
};

export default Shelters;
