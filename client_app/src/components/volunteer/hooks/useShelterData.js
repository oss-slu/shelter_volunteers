import { useState, useEffect } from 'react';
import { GETHELP_API } from '../../../config';
import ShiftsData from "../ShiftsData";

export const useShelterData = (defaultRadius) => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [latitude, setLatitude] = useState(33.997103);
  const [longitude, setLongitude] = useState(-118.4472731);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(true);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [latitude, longitude, radius]);

  const fetchData = () => {
    setLoading(true);
    const newEndpoint = `${GETHELP_API}v2/facilities?page=0&pageSize=1000&latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    
    fetch(newEndpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      // uncomment this when we switch to using our /shelter API endpoint
      // .then(data => {
      //   setOriginalData(data.content);
      //   setLoading(false);
      // })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    // convert ShiftsData into an array format expected by ShelterList
    const sheltersArray = Object.keys(ShiftsData).map((shelterKey) => ({
      id: shelterKey,  // assign a unique identifier
      name: ShiftsData[shelterKey].name,
      distance: ShiftsData[shelterKey].distance,
      shifts: ShiftsData[shelterKey].shifts
    }));

    setOriginalData(sheltersArray);
    setLoading(false);
  }, []);

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  };

  const setLocation = (location) => {
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  };

  const setRadiusfromLocation = (event) => {
    setRadius(event.target.value);
  };



  return {
    data,
    setData,
    originalData,
    loading,
    setLoading,
    noSearchDataAvailable,
    setNoSearchDataAvailable,
    getLocation,
    setRadiusfromLocation
  };
};