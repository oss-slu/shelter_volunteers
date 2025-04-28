import { useState, useEffect } from 'react';
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
          const payload = await shelterAPI.getShelters();

          // define hardcoded shift times
          const defaultShifts = [
            { id: "1", start: 1739761200000, end: 1739775600000, title: "Early Morning Shift" }, 
            { id: "2", start: 1739782800000, end: 1739797200000, title: "Morning Shift" },    
            { id: "3", start: 1739804400000, end: 1739818800000, title: "Afternoon Shift" },     
            { id: "4", start: 1739818800000, end: 1739833200000, title: "Night Shift" }         
          ];

          const sheltersWithShifts = payload.map((shelter, index) => ({
            ...shelter,
            id: shelter._id ? shelter._id.$oid || shelter._id : `shelter-${index + 1}`, // Ensure id exists
            shifts: defaultShifts.map((shift) => ({ ...shift, id: `${shelter._id || index}-${shift.id}` })), // Unique ID for each shift
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
