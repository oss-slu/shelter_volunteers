import { useState, useEffect } from "react";

import { SERVER } from "./config";

import ShelterList from "./Components/ShelterList";

function Shelters() {
  const [data, setData] = useState([]);
  const shelters_endpoint = SERVER + "/shelters";
  useEffect(() => {
    fetch(shelters_endpoint, {
      methods: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => await response.json())
      .then((response) => setData(response))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <ShelterList shelters={data} />
    </div>
  );
}

export default Shelters;
