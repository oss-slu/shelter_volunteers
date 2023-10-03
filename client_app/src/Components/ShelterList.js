const ShelterList = (props) => {
  return (
    <div>
      {/* Display the shift*/}
      {props.shelters &&
        props.shelters
          .sort((a, b) => a.distance - b.distance)
          .map((shelter) => {
            return (
              <div class="shift text-center" key={shelter.id}>
                <h2>{shelter.name}</h2>
                <p>
                  {shelter.city}, {shelter.state} {shelter.zipCode}
                </p>
                <p>{+shelter.distance.toFixed(2)} miles away</p>
                <hr />
              </div>
            );
          })}
    </div>
  );
};

export default ShelterList;
