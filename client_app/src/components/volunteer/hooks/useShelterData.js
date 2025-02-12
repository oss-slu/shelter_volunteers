import { useState, useEffect } from 'react';
import { GETHELP_API } from '../../../config';

export const useShelterData = (defaultRadius) => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [latitude, setLatitude] = useState(33.997103);
  const [longitude, setLongitude] = useState(-118.4472731);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(true);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);
  
  const fetchData = () => {
    setLoading(true);
    const newEndpoint = `${GETHELP_API}v2/facilities?page=0&pageSize=1000&latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    
    fetch(newEndpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(data => {
        setOriginalData(data.content);
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

  useEffect(() => {
    fetchData();
  }, [latitude, longitude, radius]);

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