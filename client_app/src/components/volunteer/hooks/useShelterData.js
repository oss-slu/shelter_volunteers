import { useState, useEffect } from 'react';
import { serviceShiftAPI } from '../../../api/serviceShift';
import { shelterAPI } from '../../../api/shelter';

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
  
      try {
        // retrieve all shelters from the server
        const shelters = await shelterAPI.getShelters();

        // retrieve all future shifts from the server
        // for now, each shelter we have will have all these shifts
        // this is wrong. We need to map the right shifts to the right shelters
        // based on the shelter_id defined in each service_shift
        const allShifts = await serviceShiftAPI.getFutureShifts();
        console.log("all shifts:", allShifts);

        const sheltersWithShifts = shelters.map((shelter) => ({
          ...shelter,
          id: shelter._id, // Ensure id exists
          shifts: allShifts.map((shift) => ({ ...shift, id: `${shelter._id}-${shift._id}` })), // Unique ID for each shift
        }));

        setOriginalData(sheltersWithShifts);
        setData(sheltersWithShifts);
        setLoading(false);
      } catch (error) {
        console.error("fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude, radius]);


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
