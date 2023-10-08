import { useEffect, useState } from "react";
import ShiftList from "./ShiftList";

const ShelterList = (props) => {
  let allShifts = [];
  const [checked, setChecked] = useState([]);

  function onShiftClick(event) {
    let id = event.target.id;
    let shift = id.split("-")[2] + "-" + id.split("-")[3];
    if (checked.includes(shift) && !event.target.checked) {
      let index = checked.indexOf(shift);
      let newChecked = [];
      for (let i = 0; i < checked.length; i++) {
        if (i !== index) {
          newChecked.push(checked[i]);
        }
      }
      setChecked(newChecked);
    } else if (!checked.includes(shift) && event.target.checked) {
      setChecked([...checked, shift]);
    }

    if (props.manageShiftsFunction) {
      let selectedShifts = [];
      for (let i = 0; i < allShifts.length; i++) {
        if (checked.includes(allShifts[i].code)) {
          selectedShifts.push(allShifts[i]);
        }
      }
      props.manageShiftsFunction(selectedShifts);
    }
  }

  useEffect(() => {
    if (props.manageShiftsFunction) {
      let selectedShifts = [];
      for (let i = 0; i < allShifts.length; i++) {
        if (checked.includes(allShifts[i].code)) {
          selectedShifts.push(allShifts[i]);
        }
      }
      props.manageShiftsFunction(selectedShifts);
    }
  }, [checked]);

  return (
    <div>
      <div>
        {/* Display the shelters*/}
        {props.shelters &&
          props.shelters
            .sort((a, b) => a.distance - b.distance)
            .map((shelter, index) => {
              let shifts = [
                {
                  code: shelter.id + "-ffff",
                  shelter: shelter.id,
                  start_time: 1696352400000,
                  end_time: 1696359600000,
                  worker: null,
                },
                {
                  code: shelter.id + "-gggg",
                  shelter: shelter.id,
                  start_time: 1696359600000,
                  end_time: 1696366800000,
                  worker: null,
                },
              ];
              if (
                props.loadingFunction &&
                index === props.shelters.length - 1
              ) {
                props.loadingFunction(false);
              }
              allShifts = allShifts.concat(shifts);
              return (
                <div class="shelter text-center" key={shelter.id}>
                  <h2>{shelter.name}</h2>
                  <p>
                    {shelter.city}, {shelter.state} {shelter.zipCode}
                  </p>
                  <p>{+shelter.distance.toFixed(2)} miles away</p>
                  <ShiftList
                    shifts={shifts}
                    fromShelter={true}
                    onCheck={onShiftClick}
                  />
                  <hr />
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ShelterList;
