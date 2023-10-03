import { useState, useEffect } from "react";

import ShelterList from "./Components/ShelterList";

function Shelters() {
  const [data, setData] = useState([]);
  const [latitude, setLatitude] = useState(41.8781);
  const [longitude, setLongitude] = useState(-87.6298);
  const [radius, setRadius] = useState("10");

  let shelters_endpoint =
    "https://api2-qa.gethelp.com/v2/facilities?page=0&pageSize=1000";
  let volunteers_endpoint = "https://api2-qa.gethelp.com/volunteers/";

  useEffect(() => {
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
      .then((shelters) => setData(shelters))
      .catch((error) => console.log(error));
  }, [latitude, longitude, radius, shelters_endpoint, volunteers_endpoint]);

  function getLocation() {
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

  return (
    <div>
      <div class="text-center">
        <button onClick={getLocation}>Get Shelters from Location</button>
        <br />
        <label for="radius-select">Radius (miles): </label>
        <select id="radius-select" onChange={setRadiusfromLocation}>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      <ShelterList shelters={data} />
    </div>
  );
}

export default Shelters;
