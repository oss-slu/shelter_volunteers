import { useState, useEffect } from 'react';
import { shelterAPI } from '../../../api/shelter';
import { serviceShiftAPI } from '../../../api/serviceShift';

export const useShelterData = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);

  useEffect(() => 
  {
    const fetchData = async () => {
      setLoading(true);
      try {
          const shelters = await shelterAPI.getShelters();
          const futureShifts = await serviceShiftAPI.getFutureShifts();

            const sheltersWithShifts = shelters.map((shelter) => ({
            ...shelter,
            id: shelter._id, // Ensure id exists
            shifts: futureShifts
              .filter((shift) => shift.shelter_id === shelter._id) // Match shelter_id with shelter id
              .map((shift) => ({ ...shift, id: shift._id })), // Unique ID for each shift
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
  }, []);

  return {
    data,
    setData,
    originalData,
    loading,
    setLoading,
    noSearchDataAvailable,
    setNoSearchDataAvailable,
  };
};
