import { useState, useEffect } from 'react';
import { shelterAPI } from '../../../api/shelter';
import { serviceShiftAPI } from '../../../api/serviceShift';

export const useShelterData = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSearchDataAvailable, setNoSearchDataAvailable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shelters = await shelterAPI.getShelters();
        const futureShifts = await serviceShiftAPI.getFutureShifts();

        // inject mock shifts for testing
        const MOCK_SHELTER_ID = "67cf15726dfd259eb82b7c2d"; // SLU Winter Inn
        const MOCK_SHIFTS = [
          {
            id: "Test Afternoon Shift",
            shift_start: 1746127200000, // 2 PM
            shift_end: 1746134400000,   // 4 PM
            title: "34545"
          },
          {
            id: "Mock Morning Shift",
            shift_start: 1746213600000, // 8 AM
            shift_end: 1746228000000,   // 12 PM
            title: "78790"
          }
        ];

        const sheltersWithShifts = shelters.map((shelter) => {
          let shifts = futureShifts
            .filter((shift) => shift.shelter_id === shelter._id)
            .map((shift) => ({ ...shift, id: shift._id }));

          // Add mock shifts if this is SLU Winter Inn
          if (shelter._id === MOCK_SHELTER_ID) {
            const mockShiftsFormatted = MOCK_SHIFTS.map(shift => ({ ...shift, id: shift._id }));
            shifts = [...shifts, ...mockShiftsFormatted];
          }

          return {
            ...shelter,
            id: shelter._id, // ensure id exists
            shifts
          };
        });

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
