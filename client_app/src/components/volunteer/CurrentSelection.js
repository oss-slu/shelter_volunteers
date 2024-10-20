import React, { useEffect, useState } from "react";
import ShiftList from "./ShiftList";

const CurrentSelection = ({ selectedShifts, removeShift, submitShifts }) => {
  const [overlaps, setOverlaps] = useState(false);

  //new checking overlap function
  const checkForOverallOverlap = () => {
    for (let i = 0; i < selectedShifts.length; i++) {
      for (let j = i + 1; j < selectedShifts.length; j++) {
        const shift1 = selectedShifts[i];
        const shift2 = selectedShifts[j];

        const shift1Start = new Date(shift1.start_time);
        const shift1End = new Date(shift1.end_time);
        const shift2Start = new Date(shift2.start_time);
        const shift2End = new Date(shift2.end_time);

        if (
          (shift1Start < shift2End && shift1End > shift2Start) ||
          (shift2Start < shift1End && shift2End > shift1Start)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // updates overlapping state when the selected shifts change
  useEffect(() => {
    setOverlaps(checkForOverallOverlap());
  }, [selectedShifts]);

  return (
    <div className="current-selection">
      <h2>Current Selection</h2>
      <ShiftList
        shifts={selectedShifts}
        currentSelectionSection={true}
        onClose={removeShift} // passing the removing function here thru shift list
      />
      <div id="submit-shifts" data-testid="submit-shifts-button">
        <button onClick={submitShifts} disabled={overlaps}>
          Submit Shifts
        </button>
      </div>
    </div>
  );
};

export default CurrentSelection;
