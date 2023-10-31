import { useState, useEffect } from "react";

import ShelterList from "./Components/ShelterList";
import { SERVER } from "./config";
import { Link } from "react-router-dom";

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
  }, [latitude, longitude, radius, shelters_endpoint, volunteers_endpoint]);

  function getLocation() {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  }

  function setLocation(location) {
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  function setRadiusfromLocation(event) {
    setRadius(event.target.value);
  }

  function manageShifts(shifts) {
    setSelectedShifts(shifts);
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
      .then(() => alert("You have submitted the shifts successfully"))
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    setButtonDisabled(selectedShifts.length === 0);
  }, [selectedShifts]);

  return (
    <div>
      {!props.condensed && <div></div>}
      <div class="text-center">
        {!props.condensed && <h1>Shelters</h1>}
        <button onClick={getLocation}>Get Shelters from Location</button>
        <br />
        {!props.condensed && (
          <div>
            <label for="radius-select">Radius (miles): </label>
            <select id="radius-select" onChange={setRadiusfromLocation}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        )}
      </div>
      {loading && <div class="loader"></div>}
      <ShelterList
        shelters={data}
        loadingFunction={setLoading}
        manageShiftsFunction={manageShifts}
      />
      {props.condensed && (
        <div class="text-center">
          <Link to="/shelters">
            <button>View All Shelters</button>
          </Link>
        </div>
      )}
      {!props.condensed && (
        <div class="footer">
          <button
            id="submit-shifts"
            onClick={submitShifts}
            disabled={isButtonDisabled}
          >
            Sign up for shifts
          </button>
        </div>
      )}
    </div>
  );
};

export default Shelters;
