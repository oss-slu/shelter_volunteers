import { useEffect, useState } from "react";
import IndividualShelter from "./IndividualShelter";

const ShelterList = (props) => {
  let allShifts = [];
  const [checked, setChecked] = useState([]);

  // useEffect(() => {
  //   if (props.manageShiftsFunction) {
  //     let selectedShifts = [];
  //     for (let i = 0; i < allShifts.length; i++) {
  //       if (checked.includes(allShifts[i].code)) {
  //         selectedShifts.push(allShifts[i]);
  //       }
  //     }
  //     props.manageShiftsFunction(selectedShifts);
  //   }
  // }, [checked]);

  function addShift(shift) {
    if (props.manageShiftsFunction) {
      props.manageShiftsFunction(shift);
    }
  }

  return (
    <div>
      <div>
        {/* Display the shelters*/}
        {props.shelters &&
          props.shelters
            .sort((a, b) => a.distance - b.distance)
            .map((shelter, index) => {
              if (
                props.loadingFunction &&
                index === props.shelters.length - 1
              ) {
                props.loadingFunction(false);
              }
              return (
                <div>
                  <IndividualShelter
                    shelter={shelter}
                    isSignupPage={props.isSignupPage}
                    addShiftFunction={addShift}
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ShelterList;
