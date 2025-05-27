import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewShifts from "./ViewShifts.js";
import "../../styles/shelter/UpcomingShifts.css";
import { serviceShiftAPI } from "../../api/serviceShift.js";

const UpcomingShifts = () => {
  const { shelterId } = useParams();
  const [shiftDetailsData, setShiftDetailsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await serviceShiftAPI.getFutureShiftsForShelter(shelterId);
        setShiftDetailsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching future shifts:", error);
        setLoading(false);
        setError("Failed to load future shifts: " + error.message);
      }
    };
    fetchShifts();
  }, [shelterId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    error ? (
      <div className="message error">
        {error}
      </div>
    ) : shiftDetailsData.length === 0 ? (
      <div className="message success">
        No upcoming shifts found. You can create shifts by going to the Schedule Shifts page in the menu.
      </div>
    ) : (
      <div className="upcoming-shifts">
        <h2>Upcoming Shifts</h2>
        <ViewShifts shiftDetailsData={shiftDetailsData} />
      </div>
    )
  );
};

export default UpcomingShifts;