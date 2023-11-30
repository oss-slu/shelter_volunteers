import { useState, useEffect } from "react";

import { SERVER } from "./config";

import ShiftList from "./Components/ShiftList";
import getAuthHeader from "./authentication/getAuthHeader";

function Shifts(request_endpoint) {
  const [data, setData] = useState([]);
  const header = getAuthHeader();

  useEffect(() => {
    fetch(request_endpoint, {
      methods: "GET",
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => setData(response))
      .catch((error) => console.log(error));
  },[]);

  return (
    <div>
      <ShiftList shifts={data} />
    </div>
  );
}
export function UpcomingShifts() {
  const time_now = new Date().getTime();
  const shelters_endpoint = SERVER + "/shifts?filter_start_after=" + time_now;
  return (
    <div>
      <h1 class="text-center">Upcoming Shifts</h1>
      {Shifts(shelters_endpoint)}
    </div>
  );
}

export function PastShifts() {
  const time_now = new Date().getTime();
  const shelters_endpoint = SERVER + "/shifts?filter_end_before=" + time_now;
  return (
    <div>
      <h1 class="text-center">Previous Shifts</h1>
      {Shifts(shelters_endpoint)}
    </div>
  );
}
