import ShiftList from "./ShiftList";

const ShelterList = (props) => {
  let allShifts = [];
  let checked = [];
  function onShiftClick(event) {
    let id = event.target.id;
    let shift = id.split("-")[2] + "-" + id.split("-")[3];
    if (checked.includes(shift) && !event.target.checked) {
      let index = checked.indexOf(shift);
      checked.splice(index, 1);
    } else if (!checked.includes(shift) && event.target.checked) {
      checked.push(shift);
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
