import IndividualShelter from "./IndividualShelter";

const ShelterList = (props) => {
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
                <div key={shelter.id}>
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
