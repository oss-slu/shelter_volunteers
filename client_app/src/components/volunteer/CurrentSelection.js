import React, { useEffect, useState } from "react";
import ShiftList from "./ShiftList";

const CurrentSelection = props => {
  const { selectedShifts, removeShift, submitShifts, isButtonDisabled } = props;
  const [overlaps, setOverlaps] = useState(false);

  //new checking overlap function
  const checkForOverallOverlap = () => {
    for (let i = 0; i < selectedShifts.length; i++) {
      for (let j = i + 1; j < selectedShifts.length; j++) {
        const shift1 = selectedShifts[i];
        const shift2 = selectedShifts[j];

        const shift1Start = new Date(shift1.shift_start);
        const shift1End = new Date(shift1.shift_end);
        const shift2Start = new Date(shift2.shift_start);
        const shift2End = new Date(shift2.shift_end);

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
        onClose={removeShift}
        setOverlaps={setOverlaps} // passing the removing function here thru shift list
      />
      <div id="submit-shifts" data-testid="submit-shifts-button">
        <button onClick={submitShifts} disabled={overlaps || isButtonDisabled}>
          Submit Shifts
        </button>
      </div>
    </div>
  );
};

export default CurrentSelection;
