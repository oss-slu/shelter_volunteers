import { useState, useEffect } from 'react';
import { SERVER } from '../../../config';

export const useShelterData = (defaultRadius) => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [latitude, setLatitude] = useState(33.997103);
  const [longitude, setLongitude] = useState(-118.4472731);
  const [radius, setRadius] = useState(defaultRadius);
  const [loading, setLoading] = useState(true);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);

  useEffect(() => 
  {
    const fetchData = async () => {
      setLoading(true);
      const newEndpoint = `${SERVER}/shelter`;

      try {
        const response = await fetch(newEndpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const payload = await response.json();
        console.log(payload)
        setOriginalData(payload);
        setData(payload);
        setLoading(false);
      } catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude, radius]);

  /*
  const fetchData = async () => {
    setLoading(true);
    const newEndpoint = `${SERVER}/shelter`;

    console.log("fetching shelters from:", newEndpoint);

    try {
      const response = await fetch(newEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const payload = await response.json();
      console.log(payload);

      const rawText = await response.text();
      let data;


      try {
        // check if the response is multiple concatenated objects
        if (rawText.trim().startsWith("{") && rawText.trim().endsWith("}")){
          const fixedJson = `[${rawText.replace(/}{/g, "},{")}]`; // ensure it is a valid array
          data = JSON.parse(fixedJson);
        } else {
          data = JSON.parse(rawText);
        }
      } catch (parseError){
      console.error("JSON parse error:", parseError);
      console.error(" ~~ raw response ~~ ", rawText);
      data = {};
    }

      console.log("shelters fetched from API:", data);

      if (!data?.content || !Array.isArray(data.content)) {
        console.error("API response does not contain a valid 'content' array", data);
        setOriginalData([]);
        setData([]);
      } else {
        setOriginalData(data.content);
        setData(data.content);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("fetch error:", error);
      setLoading(false);
    }
  };
*/
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
    setRadiusfromLocation,
  };
};
