import { useState, useEffect } from "react";
import ViewShifts from "./ViewShifts.js";
import { serviceShiftAPI } from "../../api/serviceShift.js";

const UnderstaffedShifts = ({shelterId}) => {
    const [shiftsData, setShiftsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchShifts = async () => {
        try {
          const data = await serviceShiftAPI.getFutureShiftsForShelter(shelterId);
          setShiftsData(data);
          setIsLoading(false);
        }
        catch (error) {
          console.error("Error fetching future shifts:", error);
          setIsLoading(false);
        }
      }
      fetchShifts();
    }, [shelterId]);
    
    // Filter shiftsData to only include shifts that are understaffed
    const understaffedShifts = shiftsData.filter(shift => 
        shift.volunteers.length < shift.required_volunteer_count
    );

    return (
      <div className="upcoming-shifts">
        {isLoading ? (
          <div className="p-4 text-center text-gray-600">
            Loading shifts data...
          </div>
        ) : understaffedShifts.length > 0 ? (
          <ViewShifts shiftDetailsData={understaffedShifts} />
        ) : (
          <div className="p-4 text-center text-gray-600">
            No understaffed shifts found.
          </div>
        )}
      </div>
    );
}

export default UnderstaffedShifts;