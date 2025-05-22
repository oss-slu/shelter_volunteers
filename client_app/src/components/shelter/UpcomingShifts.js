import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewShifts from "./ViewShifts.js";
import "../../styles/shelter/UpcomingShifts.css";
import { serviceShiftAPI } from "../../api/serviceShift.js";

const UpcomingShifts = () => {
  const { shelterId } = useParams();
  const [shiftDetailsData, setShiftDetailsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await serviceShiftAPI.getFutureShiftsForShelter(shelterId);
        setShiftDetailsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching future shifts:", error);
        setLoading(false);
        //setError("Failed to load future shifts");
      }
    };
    fetchShifts();
  }, [shelterId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="upcoming-shifts">
      <h2>Upcoming Shifts</h2>
      <ViewShifts shiftDetailsData={shiftDetailsData} />
    </div>
  );
};

export default UpcomingShifts;