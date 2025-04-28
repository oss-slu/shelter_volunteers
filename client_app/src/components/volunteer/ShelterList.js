import IndividualShelter from "./IndividualShelter";
import { useEffect } from "react";

const ShelterList = (props) => {
  useEffect(() => {
    if (props.loadingFunction) {
      props.loadingFunction(false);
    }
  });

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
            .map((shelter) => {
              return (
                <div key={shelter._id}>
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
