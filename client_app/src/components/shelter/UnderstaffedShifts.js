import { shiftDetailsData } from "./ShiftDetailsData.tsx";
import ViewShifts from "./ViewShifts.js";
import { useState } from "react";
import { useEffect } from "react";

const UnderstaffedShifts = () => {
    const [shiftsData, setShiftsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch with setTimeout
        setIsLoading(true);
        setShiftsData(shiftDetailsData);
        setIsLoading(false);
    }, []);
    
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