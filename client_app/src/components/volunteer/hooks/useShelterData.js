import { useState, useEffect } from 'react';
//import { GETHELP_API } from '../../../config';
import { SERVER } from '../../../config';

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
    const newEndpoint = `${SERVER}/shelter`;
    
    fetch(newEndpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      // uncomment this when we switch to using our /shelter API endpoint
       .then(data => {
         setOriginalData(Array.isArray(data?.content) ? data.content : []); // ensuring it is an array
         setLoading(false);
       })
      .catch(error => console.log(error));
  };

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